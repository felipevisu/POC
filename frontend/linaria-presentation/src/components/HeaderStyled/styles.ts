import { styled } from "@linaria/react";

export const Header = styled.header`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
`;

export const Logo = styled.div`
  flex: 20%;

  h1 {
    font-size: 24px;
  }
`;

export const Menu = styled.nav`
  flex: 60%;

  ul {
    display: flex;
    list-style: none;
    justify-content: center;
    gap: 16px;
    padding-left: 0;
    margin-left: 0;

    li {
      padding-left: 0;
      margin-left: 0;

      a {
        cursor: pointer;
      }
    }
  }
`;

export const Actions = styled.div`
  flex: 20%;
  display: flex;
  justify-content: end;
`;

type ButtonColors = "primary" | "success" | "info" | "warning" | "error";

const buttonColors: Record<ButtonColors, string> = {
  primary: "purple",
  success: "green",
  info: "dodgerblue",
  warning: "goldenrod",
  error: "red",
};

export const Button = styled.button<{ color: ButtonColors }>`
  background: ${(props) => buttonColors[props.color]};
  color: #fff;
  padding: 16px;
`;
