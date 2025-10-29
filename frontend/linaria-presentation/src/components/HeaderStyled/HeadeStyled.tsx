import { Actions, Header, Logo, Menu } from "./styles";

function HeaderStyled() {
  return (
    <Header>
      <Logo>
        <h1>Linaria CSS</h1>
      </Logo>
      <Menu>
        <ul>
          <li>
            <a>Home</a>
          </li>
          <li>
            <a>Portfolio</a>
          </li>
          <li>
            <a>Contact</a>
          </li>
        </ul>
      </Menu>
      <Actions>
        <button>Login</button>
      </Actions>
    </Header>
  );
}

export default HeaderStyled;
