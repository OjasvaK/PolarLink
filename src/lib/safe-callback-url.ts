// Only allow same-site relative paths as post-sign-in destinations, so a
// crafted ?callbackUrl= can’t bounce users to another site.
export function safeCallbackUrl(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
