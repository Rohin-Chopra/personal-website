import js from "@eslint/js";
import pluginRouter from "@tanstack/eslint-plugin-router";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "src/routeTree.gen.ts",
      "playwright-report",
      "test-results",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginRouter.configs["flat/recommended"],
  reactHooks.configs.flat["recommended-latest"],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  prettier,
);
