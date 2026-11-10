const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const ESLintPlugin = require("eslint-webpack-plugin");

// Drop the RTL CSS plugin (same as b-timeline) — we only ship admin.css.
const plugins = defaultConfig.plugins.filter((p) => {
  if (
    Object.values(p).length === 2 &&
    Object.values(p)?.[1]["filename"] &&
    Object.values(p)?.[1]["filename"] === "[name]-rtl.css"
  ) {
    return false;
  }
  return true;
});

module.exports = {
  ...defaultConfig,
  // src/index.jsx -> build/admin.js + build/admin.css + build/admin.asset.php
  entry: {
    admin: "./src/index.jsx",
  },
  plugins: [...plugins, new ESLintPlugin({ extensions: ["js", "jsx"], failOnError: false })],
  optimization: {},
};
