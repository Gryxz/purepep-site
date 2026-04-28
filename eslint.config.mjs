import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["purepep-site/**", ".next/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#[0-9A-Fa-f]{3,8}$/]",
          message:
            "Hex colors are forbidden in source. Import colors from @design/tokens (purepep-site/design-system/tokens.ts).",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9A-Fa-f]{3,8}/]",
          message:
            "Hex colors in template literals are forbidden. Import from @design/tokens.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/purepep-site/design-system/**"],
              message: "Use the @design alias instead of relative paths into the submodule.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
