import type { APIRoute } from "astro";
import { tutorialPresentation } from "../data/tutorials";
import { SITE_ORIGIN, blogPages, featurePages, helpPages } from "../data/content";

export const prerender = true;

const routes = [
  "/", "/demo/", "/pricing/", "/features/", "/help/", "/blog/", "/changelog/", "/blogs/",
  ...featurePages.map(({ slug }) => `/features/${slug}/`),
  ...helpPages.map(({ slug }) => `/help/${slug}/`),
  ...blogPages.map(({ slug }) => `/blog/${slug}/`),
  ...Object.keys(tutorialPresentation).map((slug) => `/blogs/${slug}/`),
];

export const GET: APIRoute = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${new URL(route, SITE_ORIGIN)}</loc></url>`).join("\n")}\n</urlset>\n`,
  { headers: { "Content-Type": "application/xml; charset=utf-8" } },
);
