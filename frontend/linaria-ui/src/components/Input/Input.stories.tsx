import type { Meta, StoryObj } from "@storybook/react";
import Input from "./Input";

const meta: Meta<typeof Input> = {
  component: Input,
  title: "UI/Input",
};

export default meta;

export const Default: StoryObj<typeof Input> = {
  args: {
    placeholder: "Enter text...",
  },
};
