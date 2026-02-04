import useRepos from "./hooks/useRepos";

export default function Repos() {
  const { repos, error, isLoading } = useRepos();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Something went wrong!</div>;

  return (
    <ul>
      {repos.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
