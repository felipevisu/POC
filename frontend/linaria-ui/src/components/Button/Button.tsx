import { styled } from "@linaria/react";
import type { Sizes } from "../../types";
import clsx from "clsx";

type ButtonColors = "primary" | "success" | "info" | "warning" | "error";

type ButtonVariant = "default" | "outlined";

const buttonSizeMap: Record<Sizes, string> = {
  sm: "0.25rem 0.5rem",
  md: "0.5rem 1rem",
  lg: "0.75rem 1.25rem",
  xl: "1rem 1.5rem",
};

const sizeClasses: Record<Sizes, string> = {
  sm: "size-sm",
  md: "size-md",
  lg: "size-lg",
  xl: "size-xl",
};

const colorClasses: Record<ButtonColors, string> = {
  primary: "primary",
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
};

const buttonColors = {
  primary: "purple",
  success: "green",
  info: "dodgerblue",
  warning: "goldenrod",
  error: "red",
} as const;

const generateButtonStyles = () => {
  return Object.entries(buttonColors)
    .map(
      ([key, color]) => `
      &.default.${key} {
        background: ${color};
        color: white;
        &:hover {
          background: color-mix(in srgb, ${color} 80%, black);
        }
      }

      &.outlined.${key} {
        border-color: ${color};
        color: ${color};
        &:hover{
          background-color: ${color};
          color: white;
        }
      }
    `
    )
    .join("\n");
};

const variantClasses: Record<ButtonVariant, string> = {
  default: "default",
  outlined: "outlined",
};

const StyledButton = styled.button`
  all: unset;
  border-radius: 6px;
  font-size: 1rem;
  padding: ${buttonSizeMap.md};
  cursor: pointer;
  font-family: arial;
  font-weight: 500;
  text-align: center;

  ${generateButtonStyles()}

  &.outlined {
    border: 1px solid;
  }

  &.size-sm {
    font-size: 0.8rem;
    padding: ${buttonSizeMap.sm};
  }
  &.size-md {
    padding: ${buttonSizeMap.md};
  }
  &.size-lg {
    padding: ${buttonSizeMap.lg};
    font-size: 1.2rem;
  }
  &.size-xl {
    padding: ${buttonSizeMap.xl};
    font-size: 1.5rem;
  }

  &.fullWidth {
    width: 100%;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Sizes;
  fullWidth?: boolean;
  color?: ButtonColors;
  variant?: ButtonVariant;
}

const Button = ({
  size = "md",
  fullWidth = false,
  color = "primary",
  variant = "default",
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <StyledButton
      className={clsx(
        sizeClasses[size],
        colorClasses[color],
        variantClasses[variant],
        { fullWidth },
        className
      )}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
