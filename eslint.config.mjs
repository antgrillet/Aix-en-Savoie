import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nextConfig = require("eslint-config-next");

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
