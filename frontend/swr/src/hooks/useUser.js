import useSWR from "swr";
import { fetcher } from "./utils";

export default function useUser() {
  const { data, error, isLoading } = useSWR(
    "https://api.github.com/users/felipevisu",
    fetcher,
  );

  return {
    user: data,
    error,
    isLoading,
  };
}
