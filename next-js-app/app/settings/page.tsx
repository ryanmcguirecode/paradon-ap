"use client";

import { Box, ListItemDecorator, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";

import NavigationLayout from "@/components/NavigationLayout";
import { useAuth } from "@/components/AuthContext";

import UsersTab from "./UsersTab";
import DocumentsTab from "./DocumentsTab";

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
