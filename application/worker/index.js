export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return Response.json(
        {
          error: "SHOP_API_NOT_DEPLOYED",
          message: "The Neweix Shop API is not available yet. Checkout and account operations remain disabled."
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": "3600"
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
