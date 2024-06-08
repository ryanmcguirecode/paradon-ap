import Image from "next/image";
import { Box, Typography } from "@mui/joy";

export default function Logo() {
  return (
    <Box
      onClick={() => window.location.replace("/")}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        gap: "5px",
      }}
    >
      <Image src="/logo.png" alt="Paradon AI Logo" width={23} height={23} />
      <Typography
        sx={{
          //   fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,
          fontSize: "20px",
          fontWeight: "620",
        }}
      >
        Paradon
      </Typography>
    </Box>
  );
}
