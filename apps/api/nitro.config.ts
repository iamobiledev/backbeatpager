import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  modules: ["workflow/nitro"],
  preset: process.env.NITRO_PRESET ?? "vercel",
  routes: {
    "/**": {
      format: "node",
      handler: "./src/index.ts"
    }
  },
  vercel: {
    entryFormat: "node"
  },
  workflow: {
    dirs: ["src/workflows"],
    runtime: "nodejs22.x",
    sourcemap: process.env.NODE_ENV === "production" ? false : "inline"
  }
});
