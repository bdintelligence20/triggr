import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      // Disable problematic rules for now
      "react/react-in-jsx-scope": "off", // React 17+ doesn't need React in scope
      "@typescript-eslint/no-unused-vars": "off", // Allow unused variables
      "@typescript-eslint/no-explicit-any": "off", // Allow any type
    },
  },
];
