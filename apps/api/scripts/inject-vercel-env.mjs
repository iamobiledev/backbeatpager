import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const vercelRuntimeEnvKeys = [
  "API_BASE_URL",
  "CRON_SECRET",
  "DATABASE_DRIVER",
  "DATABASE_URL",
  "DIRECT_URL",
  "EMAIL_FROM",
  "RESEND_API_KEY",
  "SLACK_ACTION_SECRET",
  "SLACK_BOT_TOKEN",
  "SLACK_REQUIRED",
  "SLACK_SIGNING_SECRET",
  "WEB_BASE_URL",
  "WORKFLOW_INTERNAL_SECRET"
];

const env = Object.fromEntries(
  vercelRuntimeEnvKeys
    .map((key) => [key, process.env[key]])
    .filter((entry) => Boolean(entry[1]))
);

if (Object.keys(env).length === 0) {
  console.log("inject-vercel-env: no runtime env keys present; skipping");
  process.exit(0);
}

const functionsRoot = join(
  process.cwd(),
  ".vercel",
  "output",
  "functions"
);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (entry === ".vc-config.json") {
      files.push(full);
    }
  }
  return files;
}

let patched = 0;
for (const configPath of walk(functionsRoot)) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  config.env = { ...env, ...config.env };
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  patched += 1;
}

console.log(
  `inject-vercel-env: patched ${patched} function configs with ${Object.keys(env).length} keys`
);
