"use client";

import { useState } from "react";
import { Box, Input, Button } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function SubmitEmailComponent() {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return email.includes("@") && email.includes(".");
  };

  const handleEmailChange = (event) => {
    const email = event.target.value;
    setEmail(email);
    setEmailValid(validateEmail(email));
    setSubmitted(false);
  };

  const handleSubmit = async function () {
    setLoading(true);
    await fetch("/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "New Lead: " + email }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Message sent:", data))
      .then(() => setSubmitted(true))
      .then(() => setEmail(""))
      .then(() => setEmailValid(false));

    setLoading(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Input
        placeholder="Enter your email"
        onChange={handleEmailChange}
        value={email}
        size="lg"
        sx={{ marginRight: "5px" }}
      />
      <Button
        size="lg"
        color={submitted ? "success" : "primary"}
        disabled={!emailValid && !submitted}
        loading={loading}
        startDecorator={submitted ? <CheckCircleIcon /> : null}
        onClick={handleSubmit}
      >
        Contact Us
      </Button>
    </Box>
  );
}
