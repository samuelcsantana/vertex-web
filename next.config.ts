import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

const VERTEX_API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Proxies OAuth requests (including the popup's top-level navigation and
  // vertex-api's redirect back to /auth/*/callback) through this app's own
  // origin instead of hitting the backend's separate domain directly. That
  // makes the access_token Set-Cookie response same-origin from the
  // browser's perspective, so it lands on this app's own domain — a cookie
  // set directly by a different domain (the backend's real host) is one the
  // frontend's own cookies() calls can never see, no matter how long the
  // client polls for it.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/auth/:path*",
          destination: `${VERTEX_API_URL}/auth/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

const rehypePrettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
  theme: "github-dark",
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    // Plugins are referenced by module specifier (not imported directly) so
    // the Turbopack loader can resolve them and keep the rule serializable.
    rehypePlugins: [["rehype-pretty-code", rehypePrettyCodeOptions]],
  },
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
