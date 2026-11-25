import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export type ShopPrincipal = {
  id: string;
  role: "customer" | "staff" | "admin";
  name?: string | null;
  email?: string | null;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: ShopPrincipal | null;
};

/**
 * No legacy provider token is accepted. Account SSO is not active until the
 * first-party OAuth client is registered and the PKCE flow is verified.
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  return { req: opts.req, res: opts.res, user: null };
}
