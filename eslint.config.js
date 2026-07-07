import globals from "globals";
import js from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      }
    }
  },
  js.configs.recommended,
];
