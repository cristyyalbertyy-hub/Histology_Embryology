import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Standalone Vercel app uses `/`. Site Medical embed uses e.g. `/histology/`. */
const base = process.env.STUDIO9_SITE_BASE || "/";

const publicAssetVersion =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.GITHUB_SHA ||
  Date.now().toString(36);

const loadFallbackScript = `(function(){window.setTimeout(function(){var root=document.getElementById('root');if(root&&!root.childElementCount){root.innerHTML='<div style="font-family:DM Sans,system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1.25rem;color:#14213d;line-height:1.5"><h1 style="font-size:1.25rem;margin:0 0 0.75rem">Histology And Embryology</h1><p style="margin:0 0 0.75rem">The app did not load — usually an outdated cached file in your browser.</p><p style="margin:0"><strong>Try:</strong> hard refresh (Ctrl+Shift+R) or open in a private window.</p></div>';}},4500);})();`;

export default defineConfig({
  base,
  define: {
    __PUBLIC_ASSET_VERSION__: JSON.stringify(publicAssetVersion),
  },
  plugins: [
    react(),
    {
      name: "inject-load-fallback",
      transformIndexHtml(html) {
        return html.replace(
          "</body>",
          `<script>${loadFallbackScript}</script></body>`,
        );
      },
    },
  ],
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
