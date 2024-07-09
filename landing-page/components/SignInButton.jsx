"use client";
import { Button } from "@mui/joy";

export default function SignInButton() {
  return (
    <Button
      variant="outlined"
      color="neutral"
      // Temporary leads to book demo instead of sign in
      onClick={() =>
        window.open(
          "https://calendly.com/sales-sajr/30min",
          "_blank",
          "noopener,noreferrer"
        )
      }
      sx={{ border: "1px solid rgb(227, 232, 240)" }}
    >
      Sign in
    </Button>
  );
}
