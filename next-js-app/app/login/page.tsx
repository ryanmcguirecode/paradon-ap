"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";

import {
  Button,
  CssBaseline,
  CssVarsProvider,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Typography,
} from "@mui/joy";

import { auth } from "@/utils/auth";
import { useAuth } from "@/components/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const canLogin = email && password;

  const { user, loading } = useAuth();
  if (!loading && user) {
    router.push("/batches");
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.push("/batches");
    } catch (error) {
      console.error("Error signing in:", error);
      router.refresh();
    }
  };

  const handleKeyDown = (event) => {
    if (canLogin && event.key === "Enter") {
      signIn(email, password);
    }
  };

  return (
    <CssVarsProvider>
      <CssBaseline />
      <Sheet
        sx={{
          width: 300,
          mx: "auto",
          my: 4,
          py: 3,
          px: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "sm",
          boxShadow: "md",
        }}
        variant="outlined"
      >
        <div>
          <Typography level="h4" component="h1">
            <b>Welcome!</b>
          </Typography>
          <Typography level="body-sm">Sign in to continue.</Typography>
        </div>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            placeholder="johndoe@email.com"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FormControl>
        <Button
          sx={{ mt: 1 }}
          onClick={() => signIn(email, password)}
          disabled={!canLogin}
        >
          Log in
        </Button>
      </Sheet>
    </CssVarsProvider>
  );
}
