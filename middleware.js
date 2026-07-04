import { STATIC_ROUTE_MAP } from "../scripts/seo-data.mjs";

const BOT_RE =
  /googlebot|bingbot|baiduspider|yandex|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|petalbot/i;

export const config = {
  matcher: [
    "/((?!api/|images/|assets/|videos/|static-seo/|robots\\.txt|sitemap\\.xml|manifest\\.json|favicon\\.ico|_next/).*)"
  ]
};

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_RE.test(ua)) return;

  const { pathname } = new URL(request.url);
  const staticPath = STATIC_ROUTE_MAP[pathname];
  if (!staticPath) return;

  const target = new URL(staticPath, request.url);
  const response = await fetch(target.toString());
  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
