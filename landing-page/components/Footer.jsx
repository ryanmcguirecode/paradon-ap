import { Box, Typography } from "@mui/joy";
import Logo from "@/components/Logo";
import SubmitEmailComponent from "@/components/SubmitEmailComponent";

export default function Footer() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "200px",
        marginTop: "100px",
        position: "relative",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "850px",
          paddingTop: "25px",
          margin: "auto",
        }}
      >
        <Box>
          <Logo />
          <Typography
            level="title-md"
            variant="neutral"
            sx={{ paddingTop: "10px" }}
          >
            Faster. More Accurate. Less Expensive.
          </Typography>
        </Box>
        <Box>
          <Typography
            level="title-md"
            variant="neutral"
            sx={{ marginBottom: "5px" }}
          >
            Want us to reach out?
          </Typography>
          <SubmitEmailComponent />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "850px",
          margin: "auto",
          paddingTop: "65px",
        }}
      >
        <Typography level="body-md" variant="neutral">
          2400 Nueces St, Austin, TX 78705
        </Typography>
        <Typography level="body-md" variant="neutral">
          © 2024 Golden Sun Technologies 
        </Typography>
      </Box>
    </Box>
  );
}
