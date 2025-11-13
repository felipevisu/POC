import { css } from "@linaria/core";

export const globalStyles = css`
  :global() {
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, sans-serif;
      background-color: #f5f5f5;
    }
  }
`;

export const container = css`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;
