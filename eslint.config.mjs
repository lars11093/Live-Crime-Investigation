// Flat Config fuer das gesamte Monorepo (ESLint 9).
// Die Workspaces rufen `eslint src` in ihrem eigenen Verzeichnis auf; ESLint
// sucht die Konfiguration von dort aufwaerts und landet hier.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/server/src/**/*.ts", "packages/shared/src/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Ungenutzte Parameter mit fuehrendem _ sind Absicht (z. B. Express-`next`).
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
);
