"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/auth/firebase"; // Adjust the import path as necessary
import { getIdTokenResult } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({
  user: null,
  loading: true,
  level: null,
  organization: null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchClaims = async () => {
      const user = auth.currentUser;
      if (user) {
        const idTokenResult = await getIdTokenResult(user);
        if (
          idTokenResult &&
          idTokenResult.claims &&
          idTokenResult.claims.organization
        ) {
          setOrganization(idTokenResult.claims.organization as string);
        }
        if (
          idTokenResult &&
          idTokenResult.claims &&
          idTokenResult.claims.level
        ) {
          setLevel(idTokenResult.claims.level as string);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchClaims();
      }
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, level, organization }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
