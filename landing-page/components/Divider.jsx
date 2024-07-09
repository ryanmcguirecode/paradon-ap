import Image from "next/image";
import { Box } from "@mui/joy";
import styles from "../css/Divider.module.css";

export default function Divider() {
  return (
    <Box
      sx={{
        // backgroundColor: "rgba(241, 249, 253, 0.4)",
        paddingTop: "150px",
        paddingBottom: "150px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          boxSizing: "border-box",
          position: "relative",
          width: "100%",
          height: "15px",
        }}
      >
        <Box sx={{ flex: 1, position: "relative" }}>
          <Image
            src="/arrows.png"
            fill
            style={{
              objectFit: "contain",
            }}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Image
            src="/arrow.png"
            height={24}
            width={17}
            style={{ animation: `${styles.pulse} 3s infinite` }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Image
            src="/arrows-reverse.png"
            fill
            style={{
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
