"use client";

import { Movie, PostersDict } from "@/types";
import { Box, styled } from "@mui/material";
import { useRef, useState } from "react";

interface CarouselItemProps {
  poster: string;
}

const CarouselItem = styled(Box)<CarouselItemProps>(({ poster }) => ({
  background: `url(${poster})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  minWidth: "calc(20% - 8px)",
  margin: "0 4px",
  flex: 1,
  position: "relative",
  borderRadius: "4px",
  "&:after": {
    content: '""',
    width: "100%",
    display: "block",
    paddingBottom: "150%",
  },
}));

const CarouselContainer = styled(Box)({
  display: "flex",
  flexWrap: "nowrap",
  overflowX: "auto",
  padding: "0 48px",
  scrollBehavior: "smooth",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  "-ms-overflow-style": "none",
  "scrollbar-width": "none",
});

interface CustomButtonProps {
  align: "left" | "right";
  disabled: boolean;
}

export const ArrowButton = styled("button")<CustomButtonProps>(
  ({ align, disabled }) => ({
    all: "unset",
    position: "absolute",
    cursor: "pointer",
    width: "44px",
    textAlign: "center",
    top: 0,
    bottom: 0,
    [align]: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    "& svg": { transition: "transform 0.3s ease" },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      "& svg": {
        transform: "scale(1.5)",
      },
    },

    ...(disabled && {
      opacity: 0,
      pointerEvents: "none",
    }),
  })
);

interface DotsProps {
  total: number;
  active: number;
}

const Dots = ({ total, active }: DotsProps) => {
  return (
    <Box
      sx={{
        position: "absolute",
        right: "52px",
        top: "-24px",
        display: "flex",
        gap: "1px",
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <Box
          sx={{
            width: "16px",
            height: "2px",
            background: "#fff",
            opacity: active === i ? "1" : "0.5",
          }}
          key={i}
        />
      ))}
    </Box>
  );
};

interface CarouselProps {
  movies: Movie[];
  posters: PostersDict;
}

export const Carousel = ({ movies, posters }: CarouselProps) => {
  const [active, setActive] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: "next" | "prev") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth - 96;
      console.log(carouselRef.current.clientWidth);

      carouselRef.current.scrollLeft +=
        direction === "next" ? scrollAmount : -scrollAmount;

      setActive(direction === "next" ? active + 1 : active - 1);
    }
  };

  const totalDots = Math.ceil(movies.length / 5);

  return (
    <Box sx={{ position: "relative" }}>
      <Dots total={totalDots} active={active} />
      <CarouselContainer ref={carouselRef}>
        {movies.map((item) => (
          <CarouselItem key={item.tmdbId} poster={posters[item.tmdbId]} />
        ))}
      </CarouselContainer>
      <ArrowButton
        disabled={active === 0}
        align="left"
        onClick={() => scrollCarousel("prev")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </ArrowButton>
      <ArrowButton
        disabled={active === totalDots - 1}
        align="right"
        onClick={() => scrollCarousel("next")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </ArrowButton>
    </Box>
  );
};
