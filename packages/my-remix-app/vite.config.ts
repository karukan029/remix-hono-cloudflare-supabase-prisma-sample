import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { getLoadContext } from "./load-context";

/**
 * The Remix Vite plugin is only intended for use in your application's development server and production builds.
 * While there are other Vite-based tools such as Vitest and Storybook that make use of the Vite config file,
 * the Remix Vite plugin has not been designed for use with these tools.
 * We currently recommend excluding the plugin when used with other Vite-based tools.
 *
 * @see https://remix.run/docs/en/main/guides/vite#plugin-usage-with-other-vite-based-tools-eg-vitest-storybook
 */
export default defineConfig({
  plugins: [
    remixCloudflareDevProxy({ getLoadContext }),
    !process.env.VITEST &&
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
    tsconfigPaths(),
  ],
});
