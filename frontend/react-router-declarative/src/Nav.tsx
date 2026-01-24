import { NavLink } from "react-router";

const menus = [
  { path: "/", title: "Home" },
  { path: "/about", title: "About" },
  { path: "/Blog", title: "Blog" },
  { path: "/contact", title: "Contact" },
];

function Nav() {
  return (
    <nav>
      {menus.map((item) => (
        <NavLink
          to={item.path}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

export default Nav;
