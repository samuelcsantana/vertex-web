import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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

export default withMDX(nextConfig);
