import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { Logo } from "./Logo";

const menus = [
  { title: "Início" },
  { title: "Séries" },
  { title: "Filmes" },
  { title: "Bombando" },
  { title: "Minha Lista" },
];

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <MenuItem href={href}>
      <Typography>{children}</Typography>
    </MenuItem>
  );
};

export const Navbar = () => {
  return (
    <AppBar position="fixed" sx={{ background: "none", boxShadow: "none" }}>
      <Container>
        <Toolbar disableGutters>
          <Logo />
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {menus.map((item, index) => (
              <NavLink key={index} href="#">
                {item.title}
              </NavLink>
            ))}
          </Box>
          <Box>
            <IconButton sx={{ p: 0 }}>
              <Avatar alt="Felipe Faria" />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
