"use client";

import { useState } from "react";
import { LoginFinal } from "../components/Auth";
import { CssVarsProvider } from "@mui/joy";
import withAuth from "../components/AuthComponentWrapper"; // Adjust the import path according to your project structure

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <CssVarsProvider>
      <LoginFinal />
    </CssVarsProvider>
  );
};

export default SignUp;
