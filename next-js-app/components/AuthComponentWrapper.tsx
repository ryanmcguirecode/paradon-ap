import useAuth from "./AuthWrapper"; // Adjust the import path according to your project structure
import { Box, CircularProgress } from "@mui/joy";

const withAuth = (WrappedComponent: any) => {
  const AuthenticatedComponent = (props: any) => {
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

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
