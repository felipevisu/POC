import useUser from "./hooks/useUser";

export default function Navbar() {
  const { user } = useUser();
  if (!user) return null;
  return (
    <nav>
      <img src={user.avatar_url} alt={user.login} />
    </nav>
  );
}
