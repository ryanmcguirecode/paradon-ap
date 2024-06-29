import { ReactNode } from "react";
import Box from "@mui/joy/Box";
import Navigation from "./Navigation";
import withAuth from "@/auth/withAuth";

const AuthenticatedContent = withAuth(({ children }) => <>{children}</>);

const NavigationLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthenticatedContent>
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
    </AuthenticatedContent>
  );
};

export default NavigationLayout;
