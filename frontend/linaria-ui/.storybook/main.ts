import type { StorybookConfig } from "@storybook/react-vite";
import linaria from "@linaria/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    {
      name: "@storybook/addon-essentials",
      options: {
        docs: false,
      },
    },
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.plugins?.push(linaria());
    config.optimizeDeps ??= {};
    config.optimizeDeps.include = ["@linaria/react"];
    return config;
  },
};
export default config;
