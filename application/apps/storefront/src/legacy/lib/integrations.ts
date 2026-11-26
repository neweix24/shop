export type IntegrationStatus = {
  configured: boolean;
  message: string;
};

export function getSupabaseBrowserStatus(): IntegrationStatus {
  return {
    configured: false,
    message:
      "Neweix Account SSO is not connected. Sign-in and account-only features remain unavailable until the first-party OIDC contract is registered and verified.",
  };
}

export function getPaymentStatus(): IntegrationStatus {
  return {
    configured: false,
    message:
      "Eixon Shop payment is disabled until Supreme approves the Shop payment contract and server-to-server confirmation flow.",
  };
}

export function getPathaoStatus(): IntegrationStatus {
  return {
    configured: false,
    message:
      "Pathao delivery pricing and booking are unavailable until verified coverage and credentials are configured server-side.",
  };
}
