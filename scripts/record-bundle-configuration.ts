import path from "node:path";

import db from "../app/db.server";
import { writeConfigurationSnapshot } from "./lib/bundle-configuration-record";

function argument(name: string): string {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`Missing required --${name} argument`);
  return value;
}

async function main() {
  const shop = argument("shop");
  const bundleId = argument("bundle-id");
  const label = argument("label");
  const bundle = await db.bundle.findUnique({
    where: { id: bundleId, shopId: shop },
    include: {
      steps: {
        orderBy: { position: "asc" },
        include: {
          StepProduct: { orderBy: { position: "asc" } },
          StepCategory: { orderBy: { sortOrder: "asc" } },
        },
      },
      pricing: true,
    },
  });

  if (!bundle) throw new Error(`Bundle ${bundleId} was not found for shop ${shop}`);
  const result = await writeConfigurationSnapshot({
    bundle,
    expectedShop: shop,
    label,
    outputRoot: path.resolve(process.cwd(), "docs/fixtures/bundle-configurations/fpb"),
  });

  console.log(`Recorded ${result.jsonPath}`);
  console.log(`Human-readable record ${result.markdownPath}`);
  console.log(`Configuration SHA-256 ${result.configurationHash}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
