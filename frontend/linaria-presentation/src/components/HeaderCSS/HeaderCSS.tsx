import { actions, header, logo, menu } from "./styles";

function HeaderCSS() {
  return (
    <header className={header}>
      <div className={logo}>
        <h1>Linaria CSS</h1>
      </div>
      <nav className={menu}>
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
      </nav>
      <div className={actions}>
        <button>Login</button>
      </div>
    </header>
  );
}

export default HeaderCSS;
