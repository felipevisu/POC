import { Box, Typography } from "@mui/material";
import { Carousel } from "./Carousel";
import { Movie, PostersDict } from "@/types";

interface SessionProps {
  title: string;
  movies: Movie[];
  posters: PostersDict;
}

export const Session = ({ title, movies, posters }: SessionProps) => {
  return (
    <Box sx={{ display: "block", overflow: "hidden" }} pb={4}>
      <Box py={2} px={6}>
        <Typography fontWeight={600} fontSize="large">
          {title}
        </Typography>
      </Box>
      <Carousel movies={movies} posters={posters} />
    </Box>
  );
};
