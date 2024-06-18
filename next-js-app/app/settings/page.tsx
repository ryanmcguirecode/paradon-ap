"use client";

import { useState, useEffect } from "react";

import {
  Box,
  Button,
  IconButton,
  Input,
  ListItemDecorator,
  Option,
  Select,
  Tab,
  tabClasses,
  Table,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";

import Document from "@/types/Document";
import NavigationLayout from "@/components/NavigationLayout";
import { useAuth } from "@/components/AuthContext";

interface User {
  name: string;
  email: string;
  level: string;
}

function UsersTab() {
  const [users, setUsers] = useState<Array<User>>([]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLevel, setNewLevel] = useState("");

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
        getUsersInOrganization();
      } else {
        console.error("Error adding user: ", response);
      }
    } catch (error) {
      console.error("Error adding user: ", error);
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
    if (organization) {
      getUsersInOrganization();
    }
  }, [organization]);

  return (
    <>
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
    </>
  );
}

const DocumentsTab = () => {
  const [documentTypes, setDocumentTypes] = useState<Array<Document>>([]);

  return (
    <Tabs size="lg" orientation="vertical" sx={{ flex: 1 }}>
      <TabList
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {documentTypes.map((document, index) => (
          <Tab key={document.id}>{document.displayName}</Tab>
        ))}
      </TabList>
    </Tabs>
  );
};

export default function AdminPage() {
  return (
    <NavigationLayout>
      <Box
        sx={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          paddingTop: "20px",
        }}
      >
        <Tabs size="lg">
          <TabList
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Tab>
              <ListItemDecorator>
                <AccountCircleOutlinedIcon />
              </ListItemDecorator>
              Users
            </Tab>
            <Tab>
              <ListItemDecorator>
                <DocumentScannerOutlinedIcon />
              </ListItemDecorator>
              Documents
            </Tab>
          </TabList>
          <TabPanel value={0} sx={{ backgroundColor: "white" }}>
            <UsersTab />
          </TabPanel>
          <TabPanel value={1} sx={{ backgroundColor: "white" }}>
            <DocumentsTab />
          </TabPanel>
        </Tabs>
      </Box>
    </NavigationLayout>
  );
}
