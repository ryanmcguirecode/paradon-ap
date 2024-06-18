"use client";

import { useEffect, useState } from "react";

import { Tab, TabList, Tabs } from "@mui/joy";

import { useAuth } from "@/components/AuthContext";
import Document from "@/types/Document";

export default function DocumentsTab() {
  const [documentTypes, setDocumentTypes] = useState<Array<Document>>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  async function getOrganizationDocuments() {
    try {
      setDocumentsLoading(true);
      const response = await fetch("/api/get-organization-document-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: organization,
        }),
      });

      const data = await response.json();
      setDocumentTypes(data);
      setDocumentsLoading(false);
    } catch (error) {
      //   setError(true);
      //   setErrorMessage("Error fetching users");
      console.error("Error fetching users: ", error);
    }
  }

  const { user, loading, level, organization } = useAuth();

  useEffect(() => {
    if (organization) {
      getOrganizationDocuments();
    }
  }, [organization]);

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
}
