import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/joy";

const withAuth = (WrappedComponent: any) => {
  return (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/login");
      }
    }, [loading, user, router]);

    if (loading || !user) {
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

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
