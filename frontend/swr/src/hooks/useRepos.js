import useSWR from "swr";
import { fetcher } from "./utils";

export default function useRepos() {
  const { data, error, isLoading } = useSWR(
    "https://api.github.com/users/felipevisu/repos",
    fetcher,
  );

  return {
    repos: data,
    error,
    isLoading,
  };
}
