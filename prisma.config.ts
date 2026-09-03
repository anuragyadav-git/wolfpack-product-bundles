import { defineConfig } from "prisma/config";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

const appEnvironmentPath = "apps/OnlyBundles-app/.env";
if (existsSync(appEnvironmentPath)) {
  loadEnvFile(appEnvironmentPath);
}

export default defineConfig({
  schema: "apps/OnlyBundles-app/prisma/schema.prisma",
});
