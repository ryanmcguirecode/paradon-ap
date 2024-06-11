"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  Input,
  FormControl,
  FormLabel,
  Table,
} from "@mui/joy";
import NavigationLayout from "@/components/NavigationLayout";
import { auth } from "@/utils/auth";
import withAuth from "@/components/AuthComponentWrapper";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface User {
  name: string;
  email: string;
}

const AdminPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<Array<User>>([]);

  const addUserToOrganization = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const response = await fetch("/api/add-user-to-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: user.email,
          organization: organization,
        }),
      });

      setMessage("User added successfully");
      getUsersInOrganization(); // Refresh the list after adding a user
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const getOrganizationByEmail = async (userEmail: string) => {
    const response = await fetch("/api/get-user-organization", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: userEmail }),
    });

    const data = await response.json();
    if (response.ok) {
      setOrganization(data.organization);
    } else {
      console.error("Error fetching organization: ", data.error);
    }
  };

  async function getUsersInOrganization() {
    const response = await fetch("/api/get-users-in-organization", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organization: organization,
      }),
    });

    const data = await response.json();
    setUsers(data);
  }

  useEffect(() => {
    getOrganizationByEmail(auth!.currentUser!.email!);
  }, []);

  useEffect(() => {
    if (organization) {
      getUsersInOrganization();
    }
  }, [organization]);

  return (
    <NavigationLayout>
      <Container>
        <Typography level="h1">Manage Organization: {organization}</Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            addUserToOrganization();
          }}
          sx={{
            margin: 3,
          }}
        >
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl required>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <Button type="submit" sx={{ my: 3 }}>
            Add User
          </Button>
        </Box>
        {message && <Typography>{message}</Typography>}

        <Typography level="h2">Users in Organization</Typography>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </NavigationLayout>
  );
};

export default withAuth(AdminPage);
