import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "_legacy/**",
      "public/js/**",
    ],
  },
  {
    rules: {
      // Intentional: preserve approved static-site font + CSS paths 1:1
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-css-tags": "off",
    },
  },
];

export default eslintConfig;
