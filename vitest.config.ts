import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@backbeat/db/routing-keys",
        replacement: fileURLToPath(
          new URL("./packages/db/src/routing-keys.ts", import.meta.url)
        )
      },
      {
        find: "@backbeat/config",
        replacement: fileURLToPath(
          new URL("./packages/config/src/index.ts", import.meta.url)
        )
      },
      {
        find: "@backbeat/contracts",
        replacement: fileURLToPath(
          new URL("./packages/contracts/src/index.ts", import.meta.url)
        )
      },
      {
        find: "@backbeat/db",
        replacement: fileURLToPath(
          new URL("./packages/db/src/index.ts", import.meta.url)
        )
      },
      {
        find: "@backbeat/domain",
        replacement: fileURLToPath(
          new URL("./packages/domain/src/index.ts", import.meta.url)
        )
      },
      {
        find: "@backbeat/notifications",
        replacement: fileURLToPath(
          new URL("./packages/notifications/src/index.ts", import.meta.url)
        )
      },
      {
        find: "@backbeat/workflows",
        replacement: fileURLToPath(
          new URL("./packages/workflows/src/index.ts", import.meta.url)
        )
      }
    ]
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"]
    },
    include: [
      "apps/**/*.test.ts",
      "packages/**/*.test.ts",
      "tests/**/*.test.ts"
    ],
    fileParallelism: false,
    passWithNoTests: true,
    restoreMocks: true
  }
});
