import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

function readPort(value: string | undefined): number {
  if (!value) return 3100;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }
  return port;
}

function readAllowedOrigins(value: string | undefined): string[] {
  const origins = value === undefined
    ? ["https://www.shop.neweix.com"]
    : value.split(",").map(origin => origin.trim()).filter(Boolean);

  return origins.map(origin => {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("SHOP_ALLOWED_ORIGINS must contain valid origin URLs.");
    }

    const localDevelopment =
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname);

    if (
      (parsed.protocol !== "https:" && !(localDevelopment && parsed.protocol === "http:")) ||
      parsed.origin !== origin ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error("SHOP_ALLOWED_ORIGINS must contain exact HTTPS origins.");
    }
    return parsed.origin;
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  // Public endpoints accept small structured requests only.
  app.use(json({ limit: "16kb", strict: true }));
  app.use(urlencoded({
    extended: false,
    limit: "16kb",
    parameterLimit: 50,
  }));

  // Baseline browser security headers; TLS/HSTS stays with the trusted edge.
  app.use((_request, response, next) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    response.setHeader("Cache-Control", "no-store");
    next();
  });

  const allowedOrigins = readAllowedOrigins(process.env.SHOP_ALLOWED_ORIGINS);
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Accept", "Content-Type", "Idempotency-Key"],
    credentials: false,
    maxAge: 600,
  });

  app.setGlobalPrefix("api/v1/shop");
  app.enableShutdownHooks();
  await app.listen(readPort(process.env.PORT), "0.0.0.0");
}

void bootstrap();
