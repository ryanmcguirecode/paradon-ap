"use client";

import { useState, useEffect } from "react";

import {
  Box,
  IconButton,
  Input,
  Option,
  Select,
  Table,
  Typography,
  Alert,
} from "@mui/joy";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Warning from "@mui/icons-material/Warning";

import NavigationLayout from "@/components/NavigationLayout";
import { useAuth } from "@/components/AuthContext";

interface User {
  name: string;
  email: string;
  level: string;
}

export default function UsersTab() {
  const [users, setUsers] = useState<Array<User>>([]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { user, loading, level, organization } = useAuth();

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
        getOrganizationUsers();
      } else {
        console.error("Error adding user: ", response);
        setError(true);
        if (response.statusText.includes("invalid-email")) {
          setErrorMessage("Invalid email");
        } else if (response.statusText.includes("email-already-in-use")) {
          setErrorMessage("Email already in use");
        } else if (response.statusText.includes("weak-password")) {
          setErrorMessage(
            "Weak Password, password must be at least 6 characters long"
          );
        }
      }
    } catch (error) {
      setError(true);
      setErrorMessage("Error adding user");
      console.error("Error adding user: ", error);
    }
  };

  const deleteUser = (email: string) => async () => {
    try {
      const response = await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: organization,
          email: email,
        }),
      });

      if (response.status === 200) {
        getOrganizationUsers();
      } else {
        setError(true);
        setErrorMessage("Error deleting user");
        console.error("Error deleting user: ", response);
      }
    } catch (error) {
      setError(true);
      setErrorMessage("Error deleting user");
      console.error("Error deleting user: ", error);
    }
  };

  async function getOrganizationUsers() {
    try {
      setUsersLoading(true);
      const response = await fetch("/api/get-organization-users", {
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
      setUsersLoading(false);
    } catch (error) {
      setError(true);
      setErrorMessage("Error fetching users");
      console.error("Error fetching users: ", error);
    }
  }

  useEffect(() => {
    if (organization) {
      getOrganizationUsers();
    }
  }, [organization]);

  useEffect(() => {
    setTimeout(() => {
      setError(false);
    }, 50000);
  }, [error]);

  return (
    // <NavigationLayout>
    <>
      {error && (
        <Alert
          variant="soft"
          color="danger"
          invertedColors
          startDecorator={<Warning />}
          sx={{ alignItems: "flex-start", gap: "4rem", margin: "20px" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography level="body-md">{errorMessage}</Typography>
          </Box>
        </Alert>
      )}
      <Typography level="h3" sx={{ paddingBottom: "10px" }}>
        Users
      </Typography>
      <Table stickyFooter variant="plain">
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>Name</th>
            <th style={{ width: "215px", textAlign: "center" }}>Email</th>
            <th style={{ textAlign: "center" }}>Password</th>
            <th style={{ textAlign: "center" }}>Level</th>
            <th style={{ width: "55px", textAlign: "center" }}></th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 &&
            users.map((user, index) => (
              <tr key={user.email}>
                <td>
                  <Typography textAlign="center">{user.name}</Typography>
                </td>
                <td>
                  <Typography textAlign="center">{user.email}</Typography>
                </td>
                <td>
                  <Typography style={{ textAlign: "center" }}>
                    ********
                  </Typography>
                </td>
                <td>
                  <Typography textAlign="center">{user.level}</Typography>
                </td>
                <td>
                  <IconButton
                    variant="soft"
                    color="danger"
                    onClick={deleteUser(user.email)}
                  >
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
                <Option value="executive">Executive</Option>
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
          </tr>
        </tfoot>
      </Table>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
        }}
      ></Box>
    </>
    // </NavigationLayout>
  );
}
