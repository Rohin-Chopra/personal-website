const path = require("node:path");

module.exports = {
  extends: [
    "next/core-web-vitals",
    "next",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:tailwindcss/recommended",
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
  },
  settings: {
    tailwindcss: {
      config: path.join(__dirname, "./tailwind.config.ts"),
    },
  },
};

