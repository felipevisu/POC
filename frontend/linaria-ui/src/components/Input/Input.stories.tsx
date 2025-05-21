import type { Meta, StoryObj } from "@storybook/react";
import Input from "./Input";

const meta: Meta<typeof Input> = {
  component: Input,
  title: "UI/Input",
  argTypes: {
    size: {
      control: {
        type: "select",
      },
      options: ["sm", "md", "lg", "xl"],
    },
    error: {
      control: "boolean",
    },
    fullWidth: {
      control: "boolean",
    },
  },
};

export default meta;

export const Default: StoryObj<typeof Input> = {
  args: {
    placeholder: "Enter text...",
    size: "md",
    error: false,
    fullWidth: false,
  },
};
