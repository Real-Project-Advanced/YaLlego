import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import next from "@next/eslint-plugin-next";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  react.configs.flat.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      parser: tseslint.parser,

      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      "@next/next": next,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },

  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "app/generated/**",
    ],
  },
];