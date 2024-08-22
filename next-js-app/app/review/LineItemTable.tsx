import { Box, Typography, Table, Input, IconButton } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const DynamicTable = ({ lineItems, headers, handleChange }) => {
  const rows = lineItems || [];

  const addRow = () => {
    const newRows = [...rows, {}]; // Add a new empty row
    handleChange(newRows);
  };

  const removeLastRow = () => {
    const newRows = rows.slice(0, -1); // Remove the last row
    handleChange(newRows);
  };

  const updateRowValue = (rowIndex, header, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [header]: value,
    };
    handleChange(newRows);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        marginTop: "10px",
      }}
    >
      <Table>
        <thead
          style={{
            width: "100%",
          }}
        >
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100px",
                  textAlign: "center",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => (
                <td key={header}>
                  <Input
                    value={row[header] || ""}
                    onChange={(e) =>
                      updateRowValue(rowIndex, header, e.target.value)
                    }
                    sx={{ marginBottom: "5px" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <IconButton
          size="sm"
          color="primary"
          onClick={addRow}
          sx={{ marginRight: "5px" }}
        >
          <AddIcon />
        </IconButton>
        <IconButton
          size="sm"
          color="danger"
          onClick={removeLastRow}
          disabled={rows.length === 0} // Disable if no rows to remove
        >
          <RemoveIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DynamicTable;
