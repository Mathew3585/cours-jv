import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  // Les fichiers de code des cours sont lus à l'exécution : on les inclut dans le déploiement.
  outputFileTracingIncludes: { "/projets/**": ["./contenu/projets/**/code/**"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  // Avec Turbopack, les plugins se donnent par leur nom.
  options: { remarkPlugins: [["remark-gfm"]] },
});

export default withMDX(nextConfig);
