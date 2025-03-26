import { MovieList, PostersDict } from "@/types";
import axios from "axios";

const TMDB_API_KEY = "3afeb4475fdf58251a0c9c0560a74d54";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const initialMovies: MovieList = [
  {
    movie: { tmdbId: 862 },
    topRelated: [
      { tmdbId: 8844 },
      { tmdbId: 15602 },
      { tmdbId: 31357 },
      { tmdbId: 11862 },
      { tmdbId: 949 },
    ],
  },
  {
    movie: { tmdbId: 11860 },
    topRelated: [
      { tmdbId: 45325 },
      { tmdbId: 11443 },
      { tmdbId: 21032 },
      { tmdbId: 10858 },
      { tmdbId: 8012 },
    ],
  },
];

export const searchMovies = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query?: string
): Promise<{
  posters: PostersDict;
  movies: MovieList;
}> => {
  const posterDict: PostersDict = {};
  const allMovieIds = initialMovies.flatMap((m) => [
    m.movie.tmdbId,
    ...m.topRelated.map((rel) => rel.tmdbId),
  ]);

  const requests = allMovieIds.map(async (id) => {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`;
    try {
      const response = await axios.get(url);
      if (response.data.poster_path) {
        posterDict[id] = `${TMDB_IMAGE_BASE_URL}${response.data.poster_path}`;
      }
    } catch (error) {
      console.error(`Error fetching poster for ID ${id}:`, error);
    }
  });

  await Promise.all(requests);
  return { posters: posterDict, movies: initialMovies };
};
