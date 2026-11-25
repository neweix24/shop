# Auth/session notes

The starter authentication implementation is preserved. The client must not create a fake logged-in user when the session query is pending or fails. Use the server session cookie and refresh path, validate OAuth state with a single-use nonce, and keep the callback return path fixed to `/account` or `/`.

The UI callback uses `history.replaceState` to avoid returning to a login route through browser back navigation. Logout clears the server cookie through tRPC and removes the Preview session mirror. For Supabase, use server-side refresh/cookies and an authorization check on every customer-owned mutation.
