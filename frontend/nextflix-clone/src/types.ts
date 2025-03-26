export type Movie = {
  tmdbId: number;
};

export type MovieList = { movie: Movie; topRelated: Movie[] }[];

export type PostersDict = Record<number, string>;
