import type { Express, Request, Response } from "express";

/**
 * Legacy Manus OAuth has been retired. Do not exchange Manus codes or issue
 * Shop-local identity sessions. Neweix Account SSO is a separate release gate.
 */
export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", (_req: Request, res: Response) => {
    res.status(410).json({
      error: "Legacy authentication has been retired.",
      code: "ACCOUNT_SSO_NOT_CONFIGURED",
      message: "Use guest checkout until Neweix Account SSO is connected.",
    });
  });
}
