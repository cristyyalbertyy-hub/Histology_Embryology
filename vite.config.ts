import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const publicAssetVersion =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.GITHUB_SHA ||
  Date.now().toString(36);

export default defineConfig({
  define: {
    __PUBLIC_ASSET_VERSION__: JSON.stringify(publicAssetVersion),
  },
  plugins: [react()],
  publicDir: "public",
  server: {
    host: true,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  preview: {
    host: true,
  },
});
