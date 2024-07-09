import { Box } from "@mui/joy";
import ImageContainer from "../components/ImageContainer";
import Image from "next/image";

export default function HeroImage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "100px",
      }}
    >
      <ImageContainer width="1230px" height="630px">
        <Image
          src="/ui-screenshot-3.png"
          fill
          style={{
            objectFit: "cover",
            borderRadius: "15px",
            // border: "1px solid #d7dede",
          }}
        />
      </ImageContainer>
    </Box>
  );
}
