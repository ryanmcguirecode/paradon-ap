"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/joy";
import SignInButton from "./SignInButton";
import { BookDemoButton } from "./BookDemoButton";
import Logo from "./Logo";

export default function NavBar() {
  return (
    <Box
      sx={{
        position: "fixed",
        height: "65px",
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          maxWidth: "1150px",
          display: "flex",
          margin: "auto",
          paddingTop: "12px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        <Box sx={{ display: "flex", gap: "10px" }}>
          <SignInButton />
          <BookDemoButton />
        </Box>
      </Box>
    </Box>
  );
}
