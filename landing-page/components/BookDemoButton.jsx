"use client";
import { useState } from "react";
import { Button, Typography } from "@mui/joy";
import styles from "../css/BookDemoButton.module.css";

function navigateToBookDemo() {
  window.open(
    "https://calendly.com/sales-sajr/30min",
    "_blank",
    "noopener,noreferrer"
  );
}

export function BookDemoButton() {
  return (
    <Button
      variant="outlined"
      color="neutral"
      onClick={navigateToBookDemo}
      sx={{
        border: "1px solid black",
        backgroundColor: "black",
        "&:hover": {
          backgroundColor: "black", // Change background color on hover
        },
      }}
    >
      <Typography textColor="white" level="body-sm">
        Book a demo
      </Typography>
    </Button>
  );
}

export function HeadlineBookDemoButton() {
  const [hover, setHover] = useState(false);

  return (
    <button
      className={styles.demoButton}
      onClick={navigateToBookDemo}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Typography
        level="title-lg"
        sx={{
          paddingBottom: "10px",
          paddingTop: "10px",
        }}
      >
        Book a demo
      </Typography>
    </button>
  );
}

export function PricingBookDemoButtonDark() {
  return (
    <Button
      variant="outlined"
      color="neutral"
      onClick={navigateToBookDemo}
      sx={{
        border: "1px solid black",
        backgroundColor: "rgb(18, 24, 38)",
        "&:hover": {
          backgroundColor: "black", // Change background color on hover
        },
        width: "90%",
      }}
    >
      <Typography textColor="white" level="body-md">
        Book a demo
      </Typography>
    </Button>
  );
}

export function PricingBookDemoButtonLight() {
  return (
    <Button
      variant="soft"
      color="neutral"
      onClick={navigateToBookDemo}
      sx={{
        width: "90%",
      }}
    >
      <Typography level="body-md">Book a demo</Typography>
    </Button>
  );
}
