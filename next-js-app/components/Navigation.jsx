import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  createTheme,
  styled,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import { ThemeProvider as JoyThemeProvider } from "@mui/joy/styles";
import { Button } from "@mui/joy";
import { signOut } from "firebase/auth";
import { auth } from "@/auth/firebase";
import Logo from "./Logo";

const drawerWidth = 340;
const pages = {
  Batches: [<FolderCopyOutlinedIcon key="batches" />, "batches"],
  Archive: [<Inventory2OutlinedIcon key="archive" />, "archive"],
  "Executive View": [
    <AutoGraphOutlinedIcon key="executive-view" />,
    "executive-view",
  ],
};

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "rgb(251, 252, 254)",
  color: "black",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Navigation({ disabled }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const router = useRouter();
  const path = usePathname();

  let pathTitle;
  for (let [key, value] of Object.entries(pages)) {
    if (path === `/${key.toLowerCase()}`) {
      pathTitle = key;
    }
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <ThemeProvider
      theme={createTheme({
        typography: {
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,
        },
      })}
    >
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          open={open}
          color="info"
          elevation={0}
          sx={{ borderBottom: "1px solid #e0e0e0" }}
        >
          <Box sx={{ display: "flex" }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginRight: 0,
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingLeft: "0px",
                paddingRight: "8px",
              }}
            >
              <Logo />
              <JoyThemeProvider>
                <Box>
                  <Button onClick={() => signOut(auth)}> Sign Out </Button>
                </Box>
              </JoyThemeProvider>
            </Box>
          </Box>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {Object.entries(pages).map(([name, [icon, url]]) => (
              <ListItem key={name} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => router.push(`/${url}`)}
                  selected={path === `/${url}`}
                  disabled={disabled}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: "black",
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      opacity: open ? 1 : 0,
                      "& .MuiListItemText-primary": {
                        // Targeting the primary text
                        fontWeight: 600,
                      },
                    }}
                  >
                    {name}
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box style={{ flex: 1 }} />
          <List style={{ paddingBottom: "20px" }}>
            {Object.entries({
              Settings: [
                <SettingsOutlinedIcon key={"SettingsIcon"} />,
                "settings",
              ],
            }).map(([name, [icon, url]]) => (
              <ListItem key={name} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => router.push(`/${url}`)}
                  selected={path === `/${url}`}
                  disabled={disabled}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: "black",
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      opacity: open ? 1 : 0,
                      "& .MuiListItemText-primary": {
                        // Targeting the primary text
                        fontWeight: 600,
                      },
                    }}
                  >
                    {name}
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
