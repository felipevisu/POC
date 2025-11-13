import { styled } from "@linaria/react";

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.header`
  text-align: center;
  color: white;
  margin-bottom: 40px;

  h1 {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 18px;
    opacity: 0.9;
  }
`;

export { AppContainer, Header };
