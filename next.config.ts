import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

// Uploaded media (covers, inline post images, avatars) lives in the S3
// bucket vertex-api presigns uploads for. Allowlisting only that host keeps
// the image optimizer from being an open proxy for arbitrary URLs — pasted
// external cover URLs deliberately bypass next/image (see CoverImage.tsx).
const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

const nextConfig: NextConfig = {
  // No `cacheComponents: true` here, deliberately — it was tried and reverted:
  // next-intl 4.13.1 resolves
  // its config per request, so every server component that translates counts
  // as uncached data and nothing prerenders. Revisit when next-intl supports
  // Cache Components.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: mediaBaseUrl
      ? [new URL(`${mediaBaseUrl.replace(/\/+$/, "")}/**`)]
      : [],
    // Default (75) visibly bands/flattens covers that lean on smooth, dark
    // gradients — 90 is reserved for CoverImage specifically; everything
    // else keeps using the default.
    qualities: [75, 90],
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
