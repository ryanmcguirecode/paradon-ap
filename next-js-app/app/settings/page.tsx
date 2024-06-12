"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  Box,
  Button,
  IconButton,
  Input,
  Option,
  Select,
  Table,
  Typography,
} from "@mui/joy";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";

import NavigationLayout from "@/components/NavigationLayout";
import { useAuth } from "@/components/AuthContext";

interface User {
  name: string;
  email: string;
  level: string;
}

export default function AdminPage() {
  const [organization, setOrganization] = useState("");
  const [users, setUsers] = useState<Array<User>>([]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLevel, setNewLevel] = useState("");

  const { user, loading } = useAuth();

  const createNewUser = async () => {
    try {
      const response = await fetch("/api/create-new-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: organization,
          name: newName,
          email: newEmail,
          password: newPassword,
          level: newLevel,
        }),
      });

      if (response.status === 200) {
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewLevel("");
        getUsersInOrganization();
      } else {
        console.error("Error adding user: ", response);
      }
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
      console.error("Error fetching organization: ", data);
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
    if (!loading && user) {
      getOrganizationByEmail(user.email);
    }
  }, [loading]);

  useEffect(() => {
    if (organization) {
      getUsersInOrganization();
    }
  }, [organization]);

  return (
    <NavigationLayout>
      <Box
        sx={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          margin: "auto",
          paddingTop: "20px",
        }}
      >
        <Typography level="h3" sx={{ paddingBottom: "10px" }}>
          Users
        </Typography>
        <Table stickyFooter variant="plain">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Level</th>
              <th style={{ width: "55px" }}></th>
              <th style={{ width: "55px" }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.email}>
                <td>
                  <Input type="text" name="name" value={user.name} />
                </td>
                <td>
                  <Input type="email" name="email" value={user.email} />
                </td>
                <td>********</td>
                <td>
                  <Select defaultValue={user.level}>
                    <Option value="admin">Admin</Option>
                    <Option value="user">User</Option>
                  </Select>
                </td>
                <td>
                  <IconButton variant="soft" color="primary">
                    <UpdateOutlinedIcon />
                  </IconButton>
                </td>
                <td>
                  <IconButton variant="soft" color="danger">
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                <Input
                  type="text"
                  name="name"
                  placeholder="New User Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </td>
              <td>
                <Input
                  type="email"
                  name="email"
                  placeholder="New User Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </td>
              <td>
                <Input
                  type="password"
                  name="password"
                  placeholder="New User Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </td>
              <td>
                <Select
                  onChange={(e, value: string | null) => setNewLevel(value)}
                >
                  <Option value="admin">Admin</Option>
                  <Option value="user">User</Option>
                </Select>
              </td>
              <td>
                <IconButton
                  variant="solid"
                  color="primary"
                  disabled={!newName || !newEmail || !newPassword || !newLevel}
                  onClick={createNewUser}
                >
                  <AddOutlinedIcon />
                </IconButton>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </Table>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Button sx={{ marginTop: "10px" }}>Save Changes</Button>
        </Box>
      </Box>
    </NavigationLayout>
  );
}
