import type { APIRoute } from "astro";
import { SITE_ORIGIN, blogPages, featurePages, helpPages } from "../data/content";

export const prerender = true;

const fixedRoutes = ["/", "/demo/", "/pricing/", "/features/", "/help/", "/blog/", "/changelog/", "/blogs/", "/privacy/", "/terms/"];
const routes = [
  ...fixedRoutes,
  ...featurePages.map(({ slug }) => `/features/${slug}/`),
  ...helpPages.map(({ slug }) => `/help/${slug}/`),
  ...blogPages.map(({ slug }) => `/blog/${slug}/`),
];

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${new URL(route, SITE_ORIGIN)}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
