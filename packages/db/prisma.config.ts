import "dotenv/config";

import { defineConfig } from "prisma/config";

const unavailableDatabaseUrl =
  "postgresql://missing:missing@127.0.0.1:1/missing";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/seed.ts"
  },
  datasource: {
    url: process.env.DIRECT_URL ?? unavailableDatabaseUrl
  }
});
