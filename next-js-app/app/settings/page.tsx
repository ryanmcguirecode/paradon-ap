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
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import FunctionsIcon from "@mui/icons-material/Functions";

import NavigationLayout from "@/components/NavigationLayout";

import UsersTab from "./UsersTab";
import DocumentsTab from "./DocumentsTab";
import TransformationsTab from "./TransformationsTab";

export default function AdminPage() {
  const { user, loading, level, organization } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && level !== "executive") {
      // Redirect to login page if not an executive
      router.push("/batches");
    }
  }, [loading, level]);

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
            <Tab>
              <ListItemDecorator>
                <FunctionsIcon />
              </ListItemDecorator>
              Transformations
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
          <TabPanel
            value={2}
            sx={{
              height: "calc(100% - 100px)", // Overflowing otherwise idk why
            }}
          >
            <TransformationsTab />
          </TabPanel>
        </Tabs>
      </Box>
    </NavigationLayout>
  );
}
