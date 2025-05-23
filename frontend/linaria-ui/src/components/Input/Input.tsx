import { styled } from "@linaria/react";
import type { Sizes } from "../../types";
import clsx from "clsx";

const inputSizeMap: Record<Sizes, string> = {
  sm: "0.25rem 0.5rem",
  md: "0.5rem 1rem",
  lg: "0.75rem 1.25rem",
  xl: "1rem 1.5rem",
};

const sizeClasses: Record<Sizes, string> = {
  sm: "input-sm",
  md: "input-md",
  lg: "input-lg",
  xl: "input-xl",
};

const StyledInput = styled.input`
  all: unset;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  padding: ${inputSizeMap.md};

  &:focus {
    box-shadow: 0 0 0 1px #aaa;
    border-color: #aaa;
  }

  &.input-sm {
    font-size: 0.8rem;
    padding: ${inputSizeMap.sm};
  }
  &.input-md {
    padding: ${inputSizeMap.md};
  }
  &.input-lg {
    padding: ${inputSizeMap.lg};
    font-size: 1.2rem;
  }
  &.input-xl {
    padding: ${inputSizeMap.xl};
    font-size: 1.5rem;
  }
  &.error {
    border-color: red;
  }
  &.fullWidth {
    width: 100%;
  }
`;

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: Sizes;
  error?: boolean;
  fullWidth?: boolean;
}

const Input = ({
  size = "md",
  error = false,
  fullWidth = false,
  className,
  ...props
}: InputProps) => {
  return (
    <StyledInput
      className={clsx(sizeClasses[size], { error }, { fullWidth }, className)}
      {...props}
    />
  );
};

export default Input;
