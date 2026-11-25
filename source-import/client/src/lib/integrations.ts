export type IntegrationStatus = { configured: boolean; message: string };

export function getSupabaseBrowserStatus(): IntegrationStatus {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return url && anonKey
    ? { configured: true, message: "Supabase browser configuration detected; Account SSO still requires a registered first-party OAuth client." }
    : {
        configured: false,
        message:
          "Supabase browser auth is not configured in this environment; Neweix Account SSO is not connected to Shop yet. Guest checkout remains available.",
      };
}

export function getPaymentStatus(): IntegrationStatus {
  return {
    configured: false,
    message:
      "Payment providers are intentionally unconfigured in this source build. No payment success is recorded.",
  };
}

export function getPathaoStatus(): IntegrationStatus {
  return {
    configured: false,
    message:
      "Pathao pricing is unavailable until a server-side API or verified pricing rule is configured.",
  };
}
