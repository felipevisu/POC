import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("about", "./routes/about.tsx"),
  route("repos", "./routes/repos.tsx"),
  route("repos/:slug", "./routes/repo-details.tsx"),
  route("contact", "./routes/contact.tsx"),
] satisfies RouteConfig;
