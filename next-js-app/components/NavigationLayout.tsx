import { ReactNode } from "react";
import Box from "@mui/joy/Box";
import Navigation from "./Navigation";
import AuthWrapper from "./AuthWrapper";

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
        <AuthWrapper>{children}</AuthWrapper>
      </div>
    </Box>
  );
};

export default NavigationLayout;
