import { readBoundedJson } from "./request.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function jsonRequest(body: string, headers?: HeadersInit): Request {
  return new Request("https://shop.test/checkout", {
    method: "POST",
    headers,
    body,
  });
}

Deno.test("parses a JSON object split across streamed chunks", async () => {
  const first = new TextEncoder().encode('{"order":');
  const second = new TextEncoder().encode('"guest"}');
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(first);
      controller.enqueue(second);
      controller.close();
    },
  });
  const request = new Request("https://shop.test/checkout", { method: "POST", body });
  const value = await readBoundedJson(request, 32);
  assert(value?.order === "guest", "Expected parsed object payload");
});

Deno.test("rejects invalid JSON, arrays, and primitive JSON values", async () => {
  for (const body of ["{", "[]", "null", "42", '"text"']) {
    const value = await readBoundedJson(jsonRequest(body), 64);
    assert(value === null, `Expected rejection for ${body}`);
  }
});

Deno.test("rejects a body larger than the configured limit while streaming", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"payload":"'));
      controller.enqueue(new Uint8Array(128).fill(97));
      controller.enqueue(new TextEncoder().encode('"}'));
      controller.close();
    },
  });
  const request = new Request("https://shop.test/checkout", { method: "POST", body });
  const value = await readBoundedJson(request, 32);
  assert(value === null, "Expected oversized payload to be rejected");
});

Deno.test("rejects an oversized Content-Length before reading the body", async () => {
  const value = await readBoundedJson(
    jsonRequest('{"ok":true}', { "content-length": "1000" }),
    32,
  );
  assert(value === null, "Expected oversized declared payload to be rejected");
});

Deno.test("accepts a payload exactly at the configured byte limit", async () => {
  const body = '{"ok":1}';
  const value = await readBoundedJson(jsonRequest(body), new TextEncoder().encode(body).byteLength);
  assert(value?.ok === 1, "Expected exact-limit payload to be accepted");
});

Deno.test("rejects malformed UTF-8", async () => {
  const request = new Request("https://shop.test/checkout", {
    method: "POST",
    body: new Uint8Array([0xff, 0xfe]),
  });
  const value = await readBoundedJson(request, 8);
  assert(value === null, "Expected malformed UTF-8 to be rejected");
});

