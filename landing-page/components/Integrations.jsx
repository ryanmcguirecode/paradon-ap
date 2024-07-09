import { Box, Typography } from "@mui/joy";
import Image from "next/image";

function ImageContainer({
  children,
  height,
  width,
  marginLeft,
  marginRight,
  zIndex,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: width,
        height: height,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: "25px",
        border: "1px solid #d7dede",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        padding: "10px",
        marginLeft: marginLeft,
        marginRight: marginRight,
        zIndex: zIndex,
      }}
    >
      {children}
    </Box>
  );
}

export default function Integrations() {
  return (
    <>
      <Typography level="body" variant="neutral" sx={{ fontSize: 20 }}>
        Integrations
      </Typography>
      <Typography level="h3" sx={{ fontSize: 55, textAlign: "center" }}>
        Paradon Works with your Existing Systems
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
          // backgroundColor: "rgba(241, 249, 253, 0.4)",
          marginTop: "40px",
          boxSizing: "border-box",
          padding: "10px",
        }}
      >
        <ImageContainer
          width="120px"
          height="120px"
          marginRight="-15px"
          zIndex={1}
        >
          <Image src="/oracle-logo.png" width={100} height={100} />
        </ImageContainer>
        <ImageContainer
          width="150px"
          height="150px"
          marginRight="-15px"
          zIndex={2}
        >
          <Image
            src="/sap-logo.webp"
            width={120}
            height={120}
            style={{
              borderRadius: "25px",
            }}
          />
        </ImageContainer>
        <ImageContainer width="180px" height="180px" zIndex={3}>
          <Image
            src="/logo.png"
            width={100}
            height={100}
            style={{
              borderRadius: "25px",
            }}
          />
          <Typography level="h4" sx={{ fontSize: "27px" }}>
            Paradon
          </Typography>
        </ImageContainer>
        <ImageContainer
          width="150px"
          height="150px"
          marginLeft="-15px"
          zIndex={2}
        >
          <Image
            src="/d365-logo.jpeg"
            width={120}
            height={120}
            style={{
              borderRadius: "25px",
            }}
          />
        </ImageContainer>
        <ImageContainer
          width="120px"
          height="120px"
          marginLeft="-15px"
          zIndex={1}
        >
          <Image
            src="/infor-logo.png"
            width={80}
            height={80}
            style={{
              borderRadius: "25px",
            }}
          />
        </ImageContainer>
      </Box>
      <Typography
        level="body"
        variant="neutral"
        sx={{ fontSize: 17, paddingTop: "15px" }}
      >
        We{"'"}ll integrate with any of your systems, just let us know what you
        need
      </Typography>
    </>
  );
}
