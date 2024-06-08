import { ReactNode } from "react";
import Navigation from "./Navigation";
import Box from "@mui/joy/Box";

const NavigationLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
      }}
    >
      <Navigation />
      <div
        style={{
          flex: 1,
          paddingTop: "64px",
        }}
      >
        {children}
      </div>
    </Box>
  );
};

export default NavigationLayout;
