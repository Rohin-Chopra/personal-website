import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import tailwind from "eslint-plugin-tailwindcss";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tailwindRecommended =
  tailwind.configs["flat/recommended"] ?? tailwind.configs.recommended;

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...[tailwindRecommended].flat(),
  prettier,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
    settings: {
      tailwindcss: {
        cssConfigPath: path.join(__dirname, "app/globals.css"),
      },
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
