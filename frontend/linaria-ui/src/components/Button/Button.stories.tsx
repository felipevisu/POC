import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "UI/Button",
  argTypes: {
    size: {
      control: {
        type: "select",
      },
      options: ["sm", "md", "lg", "xl"],
    },
    fullWidth: {
      control: "boolean",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "success", "info", "warning", "error"],
    },
    variant: {
      control: { type: "select" },
      options: ["default", "outlined"],
    },
  },
};

export default meta;

export const Default: StoryObj<typeof Button> = {
  args: {
    size: "md",
    fullWidth: false,
    children: "Button",
    variant: "default",
    color: "primary",
  },
};
