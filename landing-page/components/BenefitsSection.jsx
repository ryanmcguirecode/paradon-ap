import { Box, Typography } from "@mui/joy";

export default function BenefitsSection() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
        margin: "auto",
        marginTop: "40px",
        boxSizing: "border-box",
        backgroundColor: "#e8f5fc",
        padding: "10px",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography>Increase Revenue</Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography>Reduce Mistakes</Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography>Improve Understanding</Typography>
      </Box>
    </Box>
  );
}
