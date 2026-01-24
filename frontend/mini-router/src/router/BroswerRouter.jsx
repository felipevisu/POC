import { createContext, useContext, useState } from "react";

const RouterContext = createContext({ currentPath: window.location.pathname });

const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, "", path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const value = useContext(RouterContext);
  return value;
};

export const Route = ({ path, element }) => {
  const { currentPath } = useRouter();
  return currentPath === path ? element : null;
};

export const Link = ({ to, children }) => {
  const { navigate } = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
};

export default RouterProvider;
