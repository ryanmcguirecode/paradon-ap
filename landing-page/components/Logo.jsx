"use client";

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
      }}
    >
      <Image
        src="/maclogo_256x256x32.png"
        width={32}
        height={32}
        style={{ paddingRight: "5px" }}
      />
      <Typography level="h4">Golden Sun</Typography>
    </Box>
  );
}
