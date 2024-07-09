import "./globals.css";
import { Box, Typography } from "@mui/joy";

import NavBar from "@/components/NavBar";
import SKUCardGrid from "@/components/SKUCardGrid";
import DynamicLinesBox from "@/components/DynamicLinesBox";
import PricingSection from "@/components/PricingSection";
import SolutionSection from "@/components/SolutionSection";
import Integrations from "@/components/Integrations";
import BenefitsSection from "@/components/BenefitsSection";
import StepSection from "@/components/StepSection";
import SupportSection from "@/components/SupportSection";
import Divider from "@/components/Divider";
import Footer from "@/components/Footer";
import HeroImage from "@/components/HeroImage";
import HeroHeadline from "@/components/HeroHeadline";

export default function Home() {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <NavBar />
      <DynamicLinesBox>
        <HeroHeadline />
        <HeroImage />
        <Box
          sx={{
            paddingTop: "200px",
          }}
        >
          <SKUCardGrid />
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "850px",
            margin: "auto",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography level="body" variant="neutral" sx={{ fontSize: 20 }}>
            The Solution
          </Typography>
          <Typography level="h3" sx={{ fontSize: 55 }}>
            Paradon AI is the Forecasting Co-Pilot and Command Center
          </Typography>
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <SolutionSection />
          <Box sx={{ height: "70px" }} />
          {/* <BenefitsSection /> */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "850px",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "30px",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography level="body" variant="neutral" sx={{ fontSize: 20 }}>
              The Process
            </Typography>
          </Box>
          <StepSection />
        </Box>

        <Divider />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Integrations />
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <SupportSection />
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <PricingSection />
        </Box>
      </DynamicLinesBox>
      <Footer />
    </Box>
  );
}
