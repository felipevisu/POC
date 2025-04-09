import { Container, Typography } from "@mui/material";
import CharacterForm, { AddProduct } from "./Form";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function ProductForm({ addProduct }: AddProduct) {
  return (
    <Container sx={{ padding: "32px 0" }}>
      <Typography>Add new product</Typography>
      <CharacterForm addProduct={addProduct} />
    </Container>
  );
}

export default function App({ addProduct }: AddProduct) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ProductForm addProduct={addProduct} />
    </ThemeProvider>
  );
}
