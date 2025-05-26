import type { Sizes } from "../../types";
import clsx from "clsx";
import { css } from "@linaria/core";

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

const buttonColors: Record<ButtonColors, string> = {
  primary: "purple",
  success: "green",
  info: "dodgerblue",
  warning: "goldenrod",
  error: "red",
};

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

const baseButton = css`
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

type ButtonProps = {
  size?: Sizes;
  fullWidth?: boolean;
  color?: ButtonColors;
  variant?: ButtonVariant;
};

type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = object
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

type PolymorphicComponentPropWithRef<
  C extends React.ElementType = "button",
  Props = object
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

const Button = <C extends React.ElementType = "button">({
  as,
  size = "md",
  fullWidth = false,
  color = "primary",
  variant = "default",
  className,
  ref,
  ...rest
}: PolymorphicComponentPropWithRef<C, ButtonProps>) => {
  const Component = as || "button";

  return (
    <Component
      className={clsx(
        baseButton,
        sizeClasses[size],
        colorClasses[color],
        variantClasses[variant],
        { fullWidth },
        className
      )}
      ref={ref}
      {...rest}
    />
  );
};

export const Example = () => {
  return (
    <div>
      {/* By default it's a button, should accept button parameters: type */}
      <Button type="submit">Submit</Button>

      {/* When defined as link should accept link parameters: href */}
      <Button as="a" href="https://google.com">
        Link
      </Button>

      {/* Trying to pass href without saying it's a link should raise an error */}
      <Button href="https://google.com">Submit</Button>
    </div>
  );
};

export default Button;
