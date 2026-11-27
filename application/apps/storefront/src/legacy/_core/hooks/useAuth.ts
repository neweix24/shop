/**
 * Shop never creates a local or Manus identity.
 * This adapter remains closed until the Account OIDC client and token contract
 * have been registered and verified through the approved service workflow.
 */
export type ShopAuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export function useAuth() {
  return {
    user: null as ShopAuthUser | null,
    loading: false,
    error: null as Error | null,
    isAuthenticated: false,
    refresh: async () => null,
    logout: async () => undefined,
  };
}
