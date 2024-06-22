"use client";

import {
  Box,
  ListItemDecorator,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
} from "@mui/joy";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";

import NavigationLayout from "@/components/NavigationLayout";

import UsersTab from "./UsersTab";
import DocumentsTab from "./DocumentsTab";

export default function AdminPage() {
  return (
    <NavigationLayout>
      <Box
        sx={{
          width: "80%",
          margin: "auto",
          height: "100%",
        }}
      >
        <Tabs
          size="lg"
          sx={{
            height: "100%",
            backgroundColor: "transparent",
          }}
        >
          <TabList
            sx={{
              display: "flex",
              justifyContent: "center",
              [`& .${tabClasses.root}`]: {
                fontSize: "md",
                fontWeight: "lg",
                [`&[aria-selected="true"]`]: {
                  bgcolor: "background.surface",
                },
                [`&.${tabClasses.focusVisible}`]: {
                  outlineOffset: "-4px",
                },
              },
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
          <TabPanel
            value={0}
            sx={{
              height: "calc(100% - 100px)", // Overflowing otherwise idk why
            }}
          >
            <UsersTab />
          </TabPanel>
          <TabPanel
            value={1}
            sx={{
              height: "calc(100% - 100px)", // Overflowing otherwise idk why
            }}
          >
            <DocumentsTab />
          </TabPanel>
        </Tabs>
      </Box>
    </NavigationLayout>
  );
}
