#!/usr/bin/env node
/**
 * Builds a self-contained Azure App Service deployment bundle into
 * `azure-deploy/` at the repo root. Run from the repo root via:
 *
 *     pnpm run build:azure
 *
 * The output directory contains everything Azure App Service (Linux,
 * Node 20) needs to run the app: a single bundled Express server, the
 * built React frontend, a minimal package.json, and a web.config for
 * Windows App Service compatibility.
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const outDir = path.join(repoRoot, "azure-deploy");

const apiServerDir = path.join(repoRoot, "artifacts", "api-server");
const frontendDir = path.join(repoRoot, "artifacts", "was-it-worth-it");

function run(cmd, cwd, env = {}) {
  console.log(`\n→ ${cmd}  (in ${path.relative(repoRoot, cwd) || "."})`);
  execSync(cmd, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

console.log("Building Azure deployment bundle…");

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

run("pnpm run build", frontendDir, { BASE_PATH: "/", NODE_ENV: "production" });
run("pnpm run build", apiServerDir, { NODE_ENV: "production" });

const apiDist = path.join(apiServerDir, "dist");
const frontendDist = path.join(frontendDir, "dist", "public");

if (!existsSync(apiDist))
  throw new Error(`API server build output not found at ${apiDist}`);
if (!existsSync(frontendDist))
  throw new Error(`Frontend build output not found at ${frontendDist}`);

cpSync(apiDist, outDir, { recursive: true });
cpSync(frontendDist, path.join(outDir, "public"), { recursive: true });

const pkg = {
  name: "was-it-worth-it",
  version: "1.0.0",
  private: true,
  type: "module",
  main: "index.mjs",
  scripts: {
    start: "node --enable-source-maps index.mjs",
  },
  engines: {
    node: ">=20 <23",
  },
};
writeFileSync(
  path.join(outDir, "package.json"),
  JSON.stringify(pkg, null, 2) + "\n",
);

const webConfig = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.mjs" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <match url="/*" />
          <action type="Rewrite" url="index.mjs" />
        </rule>
      </rules>
    </rewrite>
    <iisnode nodeProcessCommandLine="node --enable-source-maps" />
  </system.webServer>
</configuration>
`;
writeFileSync(path.join(outDir, "web.config"), webConfig);

const envExample = `# Required: Postgres (Supabase) connection string for the database.
# Use the Supabase "Transaction pooler" connection string with your password
# URL-encoded.
SUPABASE_DATABASE_URL=postgresql://postgres.<project-ref>:<url-encoded-password>@aws-0-<region>.pooler.supabase.com:6543/postgres

# Optional: Azure App Service sets PORT automatically. Leave unset locally
# to default to 8080.
# PORT=8080
`;
writeFileSync(path.join(outDir, ".env.example"), envExample);

const readme = `# Was It Worth It? — Azure deployment bundle

This directory is a fully self-contained deployment of the app. Azure App
Service (Linux, Node 20) will run \`npm start\` which executes \`index.mjs\`.

## Required environment variables

| Name                    | Description                                  |
| ----------------------- | -------------------------------------------- |
| \`SUPABASE_DATABASE_URL\` | Supabase Postgres pooler connection string. |
| \`PORT\`                  | Set automatically by Azure App Service.     |

See \`.env.example\` for format.

## Deploy

See \`AZURE_DEPLOY.md\` at the repo root for click-by-click instructions.
`;
writeFileSync(path.join(outDir, "README.md"), readme);

console.log(`\n✓ Azure bundle ready at: ${path.relative(repoRoot, outDir)}/`);
console.log(`  Zip the contents of azure-deploy/ and upload to App Service.`);
