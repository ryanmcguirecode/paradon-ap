import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  Checkbox,
  ModalDialog,
  Modal,
} from "@mui/joy";
import { Mapping } from "@/types/Mapping";

export default function MappingsTable({
  auth,
  data,
  showMappings,
  setShowMappings,
  submitDocumentValues,
}: {
  auth: any;
  data: Mapping[];
  showMappings: boolean;
  setShowMappings: (show: boolean) => void;
  submitDocumentValues: () => void;
}) {
  const [checkedRows, setCheckedRows] = useState<Mapping[]>([]);
  const [newData, setNewData] = useState<Mapping[]>(data);

  const handleCheck = (row: Mapping) => {
    setCheckedRows((prevCheckedRows) =>
      prevCheckedRows.includes(row)
        ? prevCheckedRows.filter((r) => r !== row)
        : [...prevCheckedRows, row]
    );
  };

  const handleCheckAll = () => {
    if (checkedRows.length === newData.length) {
      setCheckedRows([]);
    } else {
      setCheckedRows(newData);
    }
  };

  const postMappings = async () => {
    const res = await fetch("/api/mappings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: checkedRows.map((row) => ({
          key: row.key,
          value: row.value,
          createdBy: auth.user.email,
          transformation: row.transformation,
        })),
        organization: auth.organization,
      }),
    });
    if (res.ok) {
      setShowMappings(false);
      submitDocumentValues();
    }
  };

  useEffect(() => {
    // get all keys and do an anti-join to get the new rows
    async function getNewRows() {
      const res = await fetch("/api/mappings-anti-join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mappings: data,
          organization: auth.organization,
        }),
      });

      if (res.ok) {
        const newRes = await res.json();
        setShowMappings(newRes.length > 0);
        newRes.sort((a, b) => a.transformation.localeCompare(b.transformation)); // Sort by transformation
        setNewData(newRes);
      }
    }
    getNewRows();
  }, [data]);

  return (
    <Modal open={showMappings} onClose={() => setShowMappings(false)}>
      <ModalDialog
        aria-labelledby="mappings-table-dialog"
        sx={{
          position: "relative",
          width: "80%",
          maxWidth: "900px",
          p: 3,
          borderRadius: "md",
          boxShadow: "lg",
        }}
      >
        <Typography id="mappings-table-dialog" level="h4">
          Mappings Table
        </Typography>
        <Box
          sx={{
            maxHeight: "400px", // Set the maximum height of the table container
            overflowY: "auto", // Enable vertical scrolling
          }}
        >
          <Table>
            <thead>
              <tr>
                <th>
                  <Checkbox
                    checked={checkedRows.length === newData.length}
                    onChange={handleCheckAll}
                  />
                </th>
                <th>Key</th>
                <th>Value</th>
                <th>Transformation</th>
              </tr>
            </thead>
            <tbody>
              {newData &&
                newData.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <Checkbox
                        checked={checkedRows.includes(row)}
                        onChange={() => handleCheck(row)}
                      />
                    </td>
                    <td>{row.key}</td>
                    <td>{row.value}</td>
                    <td>{row.transformation}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            color="warning"
            sx={{ mt: 2, mr: 2 }}
            onClick={() => setShowMappings(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            sx={{ mt: 2 }}
            disabled={checkedRows.length === 0}
            onClick={postMappings}
          >
            Save
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
