import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nextConfig = require("eslint-config-next");

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["src/generated/prisma/**"],
  },
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
