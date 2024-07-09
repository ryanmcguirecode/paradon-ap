import { HeadlineBookDemoButton } from "@/components/BookDemoButton";
import { Box, Typography } from "@mui/joy";

export default function HeroHeadline() {
  return (
    <Box
      sx={{
        // backgroundColor: "rgba(241, 249, 253, 0.4)",
        maxWidth: "800px",
        margin: "auto",
        paddingTop: "130px",
      }}
    >
      <Typography
        level="h3"
        sx={{
          margin: "auto",
          textAlign: "center",
          fontSize: "75px",
          lineHeight: "85px",
        }}
      >
        Industry Leading Document Processing
      </Typography>
      <Typography
        level="body-lg"
        sx={{
          maxWidth: "500px",
          margin: "auto",
          textAlign: "center",
          paddingTop: "8px",
        }}
      >
        Human-in-the-loop AI for document processing, data extraction, and data entry.
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "30px",
        }}
      >
        <HeadlineBookDemoButton />
      </Box>
    </Box>
  );
}
