import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "About" }, { name: "description", content: "About us" }];
}

export default function About() {
  return <div>About</div>;
}
