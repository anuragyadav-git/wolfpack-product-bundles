import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const tutorials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tutorials" }),
  schema: z.object({
    schema_version: z.literal(1),
    id: z.string(),
    title: z.string(),
    type: z.literal("tutorial"),
    status: z.enum(["draft", "published"]),
    summary: z.string(),
    last_audited: z.coerce.date(),
    owners: z.array(z.string()),
    domains: z.array(z.string()),
    systems: z.array(z.string()),
    source_paths: z.array(z.string()),
    related_docs: z.array(z.string()),
    tags: z.array(z.string()),
    keywords: z.array(z.string()),
  }),
});

export const collections = { tutorials };
