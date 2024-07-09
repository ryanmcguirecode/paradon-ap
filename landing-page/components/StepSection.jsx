import { Box, Stack, Typography } from "@mui/joy";

const stepHeight = 60;
const stepSpace = 60;

const Step = ({ stepNumber, children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      position: "relative",
      paddingBottom: stepSpace + "px",
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid #d7dede",
        borderRadius: "100%",
        width: stepHeight + "px",
        height: stepHeight + "px",
        padding: "10px",
        backgroundColor: "rgb(247, 251, 253)",
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: stepHeight + "px",
          height: stepHeight + "px",
          borderRadius: "100%",
          backgroundColor: "rgba(249, 251, 254)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #d7dede",
        }}
      >
        <Typography level="h4" sx={{ fontSize: 25 }}>
          {stepNumber}
        </Typography>
      </Box>
    </Box>
    <Box
      sx={{
        paddingLeft: "40px",
      }}
    >
      {children}
    </Box>
    {stepNumber < 3 && (
      <Box
        sx={{
          height: "100%",
          borderLeft: "4px dotted #d7dede",
          marginLeft: "40px",
          position: "absolute",
          zIndex: 1,
        }}
      />
    )}
  </Box>
);

export default function StepSection() {
  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
          boxSizing: "border-box",
          borderRadius: "20px",
          paddingLeft: "20px",
          paddingRight: "20px",
          // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Step stepNumber={1}>
          <Typography
            level="h4"
            sx={{ fontSize: 30, lineHeight: "40px", paddingBottom: "12px" }}
          >
            We ingest your POS and ordering data
          </Typography>
          <Typography level="body" variant="neutral" sx={{ fontSize: 22 }}>
            We take in your data in any format, and transform it with our
            proprietary data pipeline.
          </Typography>
        </Step>
        <Step stepNumber={2}>
          <Typography
            level="h4"
            sx={{ fontSize: 30, lineHeight: "40px", paddingBottom: "12px" }}
          >
            We build a custom prediction model for your business
          </Typography>
          <Typography level="body" variant="neutral" sx={{ fontSize: 22 }}>
            The best performing model is custom-tailored. We use your data and
            augment it with other relevant sources to deliver region and
            store-specific predictions.
          </Typography>
        </Step>
        <Step stepNumber={3}>
          <Typography
            level="h4"
            sx={{ fontSize: 30, lineHeight: "40px", paddingBottom: "12px" }}
          >
            We show you how much you can save
          </Typography>
          <Typography level="body" variant="neutral" sx={{ fontSize: 22 }}>
            We{"'"}ll run our model on your historical sales data to show you
            how much profit you can generate with us.
          </Typography>
        </Step>
      </Box>
    </Box>
  );
}
