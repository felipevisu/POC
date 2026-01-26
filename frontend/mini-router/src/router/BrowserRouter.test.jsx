import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import RouterProvider, { Route, Link, useRouter } from "./BroswerRouter";

const RouterInfo = () => {
  const { currentPath, navigate } = useRouter();
  return (
    <div>
      <span data-testid="current-path">{currentPath}</span>
      <button onClick={() => navigate("/programmatic")}>Navigate</button>
    </div>
  );
};

describe("RouterProvider", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("provides router context to children", () => {
    render(
      <RouterProvider>
        <RouterInfo />
      </RouterProvider>,
    );

    expect(screen.getByTestId("current-path")).toHaveTextContent("/");
  });

  it("initializes with window.location.pathname", () => {
    window.history.pushState({}, "", "/initial-path");

    render(
      <RouterProvider>
        <RouterInfo />
      </RouterProvider>,
    );

    expect(screen.getByTestId("current-path")).toHaveTextContent(
      "/initial-path",
    );
  });
});

describe("useRouter", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("returns currentPath and navigate function", () => {
    render(
      <RouterProvider>
        <RouterInfo />
      </RouterProvider>,
    );

    expect(screen.getByTestId("current-path")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Navigate" }),
    ).toBeInTheDocument();
  });

  it("navigate updates the current path", () => {
    render(
      <RouterProvider>
        <RouterInfo />
      </RouterProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Navigate" }));

    expect(screen.getByTestId("current-path")).toHaveTextContent(
      "/programmatic",
    );
  });

  it("navigate updates browser history", () => {
    const pushStateSpy = vi.spyOn(window.history, "pushState");

    render(
      <RouterProvider>
        <RouterInfo />
      </RouterProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Navigate" }));

    expect(pushStateSpy).toHaveBeenCalledWith({}, "", "/programmatic");
    pushStateSpy.mockRestore();
  });
});

describe("Route", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders element when path matches exactly", () => {
    render(
      <RouterProvider>
        <Route path="/" element={<div>Home Page</div>} />
      </RouterProvider>,
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("does not render when path does not match", () => {
    render(
      <RouterProvider>
        <Route path="/about" element={<div>About Page</div>} />
      </RouterProvider>,
    );

    expect(screen.queryByText("About Page")).not.toBeInTheDocument();
  });

  it("renders correct route among multiple routes", () => {
    window.history.pushState({}, "", "/contact");

    render(
      <RouterProvider>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/about" element={<div>About</div>} />
        <Route path="/contact" element={<div>Contact</div>} />
      </RouterProvider>,
    );

    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.queryByText("About")).not.toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("uses exact matching (no partial matches)", () => {
    window.history.pushState({}, "", "/about/team");

    render(
      <RouterProvider>
        <Route path="/about" element={<div>About</div>} />
      </RouterProvider>,
    );

    expect(screen.queryByText("About")).not.toBeInTheDocument();
  });
});

describe("Link", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders an anchor tag with correct href", () => {
    render(
      <RouterProvider>
        <Link to="/about">About Link</Link>
      </RouterProvider>,
    );

    const link = screen.getByRole("link", { name: "About Link" });
    expect(link).toHaveAttribute("href", "/about");
  });

  it("prevents default navigation on click", () => {
    render(
      <RouterProvider>
        <Link to="/about">About Link</Link>
      </RouterProvider>,
    );

    const link = screen.getByRole("link", { name: "About Link" });
    const clickEvent = new MouseEvent("click", { bubbles: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    link.dispatchEvent(clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("updates route when clicked", () => {
    render(
      <RouterProvider>
        <Link to="/about">Go to About</Link>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/about" element={<div>About</div>} />
      </RouterProvider>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("About")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Go to About" }));

    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <RouterProvider>
        <Link to="/test">
          <span>Nested Content</span>
        </Link>
      </RouterProvider>,
    );

    expect(screen.getByText("Nested Content")).toBeInTheDocument();
  });
});

describe("Integration: Full Navigation Flow", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("navigates through multiple routes", () => {
    render(
      <RouterProvider>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <Route path="/" element={<div>Home Page Content</div>} />
        <Route path="/about" element={<div>About Page Content</div>} />
        <Route path="/contact" element={<div>Contact Page Content</div>} />
      </RouterProvider>,
    );

    expect(screen.getByText("Home Page Content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "About" }));
    expect(screen.getByText("About Page Content")).toBeInTheDocument();
    expect(screen.queryByText("Home Page Content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Contact" }));
    expect(screen.getByText("Contact Page Content")).toBeInTheDocument();
    expect(screen.queryByText("About Page Content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(screen.getByText("Home Page Content")).toBeInTheDocument();
  });

  it("combines Link and programmatic navigation", () => {
    const PageWithButton = () => {
      const { navigate } = useRouter();
      return (
        <div>
          <h1>Page A</h1>
          <button onClick={() => navigate("/b")}>Go to B</button>
        </div>
      );
    };

    render(
      <RouterProvider>
        <Link to="/a">Link to A</Link>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/a" element={<PageWithButton />} />
        <Route path="/b" element={<div>Page B</div>} />
      </RouterProvider>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Link to A" }));
    expect(screen.getByText("Page A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go to B" }));
    expect(screen.getByText("Page B")).toBeInTheDocument();
  });
});
