import { ReactNode } from "react";
import { Box, CircularProgress } from "@mui/joy";
import useAuth from "@/utils/useAuth";

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const { loading, authenticated } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "20%",
        }}
      >
        <CircularProgress variant="outlined" />
      </Box>
    );
  }

  if (!authenticated) {
    return null;
  }

  return children;
};

export default AuthWrapper;
