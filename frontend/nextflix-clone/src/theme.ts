import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#141414",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "#fff",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#ddd",
            boxShadow: "none",
          },
        },
        containedSecondary: {
          backgroundColor: "rgba(109, 109, 110, 0.7);",
          color: "#fff",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "rgba(109, 109, 110, 0.5);",
            boxShadow: "none",
          },
        },
      },
    },
  },
});
