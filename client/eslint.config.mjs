import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintPluginPrettier,
  {
    ignores: [".next/**", "out/**", "next-env.d.ts"],
  },
  {
    // Vendored shadcn/ui primitives: copied verbatim from the shadcn CLI and
    // meant to be re-copied wholesale on future updates, not hand-edited to
    // satisfy this project's stricter React Compiler purity rules.
    files: ["components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];

export default eslintConfig;
