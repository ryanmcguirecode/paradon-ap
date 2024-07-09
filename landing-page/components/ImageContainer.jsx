import { Box } from "@mui/joy";

export default function ImageContainer({ width, height, children }) {
  return (
    <Box
      sx={{
        width: width,
        height: height,
        padding: "12px",
        border: "1px solid #d7dede",
        borderRadius: "40px",
        boxSizing: "border-box",
        backgroundColor: "rgb(247, 251, 253)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          padding: "12px",
          border: "1px solid #d7dede",
          borderRadius: "25px",
          boxSizing: "border-box",
          backgroundColor: "rgb(233, 245, 252)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </Box>
    </Box>
  );
}
