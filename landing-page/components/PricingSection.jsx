"use client"; // Have to use becasue of the `CheckCircleIcon` component, should fix later
import { Box, Typography } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  PricingBookDemoButtonDark,
  PricingBookDemoButtonLight,
} from "./BookDemoButton";

const LightColors = {
  backgroundColor: "rgb(249, 251, 254)",
  mainTextColor: "rgb(18, 24, 38)",
  secondaryTextColor: null,
  priceText: "Free",
  titleText: "Start",
  subTitleText: "Get up and running with no upfront costs",
  checklistTitleText: "Free, with no commitments:",
  checklist: [
    "Custom Model Training and Demo",
    "Integration with ERP + Other Systems",
    "Trial and Adjustment Period",
    "Custom Configuration",
    "24/7 Support",
  ],
  button: "dark",
};

const DarkColors = {
  backgroundColor: "rgb(18, 24, 38)",
  mainTextColor: "white",
  secondaryTextColor: "rgb(158, 164, 179)",
  priceText: "Custom",
  titleText: "Continue",
  subTitleText: "Keep the ball rolling with a tailored enterprise plan",
  checklistTitleText: "Once you're ready to go:",
  checklist: [
    "Custom Model Training",
    "Integration with ERP + Other Systems",
    "Continuous Model Adjustment and Tuning",
    "Custom Configuration",
    "24/7 Support",
  ],
  button: "light",
};

function PricingColumn({ variant }) {
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: variant.backgroundColor,
        border: "1px solid #d7dede",
        borderRadius: "10px",
        padding: "40px",
      }}
    >
      <Box sx={{ height: "120px" }}>
        <Typography level="h4" sx={{ color: variant.mainTextColor }}>
          {variant.titleText}
        </Typography>
        <Typography level="body-sm" sx={{ color: variant.secondaryTextColor }}>
          {variant.subTitleText}
        </Typography>
      </Box>
      <Box sx={{ height: "140px" }}>
        <Typography
          level="h1"
          sx={{
            color: variant.mainTextColor,
          }}
        >
          {variant.priceText}
        </Typography>
      </Box>
      <Box sx={{ height: "250px" }}>
        <Typography
          level="title-sm"
          sx={{ paddingBottom: "20px", color: variant.mainTextColor }}
        >
          {variant.checklistTitleText}
        </Typography>
        {variant.checklist.map((item) => (
          <Typography
            key={item}
            level="body-sm"
            startDecorator={<CheckCircleIcon fontSize="sm" />}
            sx={{ color: variant.secondaryTextColor, paddingBottom: "10px" }}
          >
            {item}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          paddingBottom: "10px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {variant.button === "light" ? (
          <PricingBookDemoButtonLight />
        ) : (
          <PricingBookDemoButtonDark />
        )}
      </Box>
    </Box>
  );
}

export default function PricingSection() {
  return (
    <>
      <Typography level="body" variant="neutral" sx={{ fontSize: 20 }}>
        Pricing
      </Typography>
      <Typography level="h3" sx={{ fontSize: 55 }}>
        We Only Charge for Value Created
      </Typography>
      <Box
        sx={{
          display: "flex",
          margin: "auto",
          gap: "8px",
          // backgroundColor: "rgba(241, 249, 253, 0.4)",
          marginTop: "40px",
          border: "1px solid #d7dede",
          borderRadius: "15px",
          boxSizing: "border-box",
          padding: "10px",
          maxWidth: "1000px",
        }}
      >
        <PricingColumn variant={LightColors} />
        <PricingColumn variant={DarkColors} />
      </Box>
    </>
  );
}
