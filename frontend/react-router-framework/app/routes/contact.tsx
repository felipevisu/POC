import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact" },
    { name: "description", content: "Contact our team" },
  ];
}

export default function Contact() {
  return <div>Contact</div>;
}
