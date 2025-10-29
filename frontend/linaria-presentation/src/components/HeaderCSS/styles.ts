import { css } from "@linaria/core";

export const header = css`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
`;

export const logo = css`
  flex: 20%;

  h1 {
    font-size: 24px;
  }
`;

export const menu = css`
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

export const actions = css`
  flex: 20%;
  display: flex;
  justify-content: end;
`;
