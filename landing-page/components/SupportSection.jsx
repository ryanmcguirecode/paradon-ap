"use client";
import Image from "next/image";
import { Box, Typography, Avatar } from "@mui/joy";
import styles from "../css/SupportSection.module.css";

import CloudIcon from "@mui/icons-material/Cloud";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

export default function SupportSection() {
  const avatarPositions = [
    {
      left: Math.cos((30 * Math.PI) / 180) * 125 + 125 - 25 + "px",
      top: -Math.sin((30 * Math.PI) / 180) * 125 + 125 - 25 + "px",
    },
    {
      left: Math.cos((150 * Math.PI) / 180) * 125 + 125 - 25 + "px",
      top: -Math.sin((150 * Math.PI) / 180) * 125 + 125 - 25 + "px",
    },
    {
      left: Math.cos((270 * Math.PI) / 180) * 125 + 125 - 25 + "px",
      top: -Math.sin((270 * Math.PI) / 180) * 125 + 125 - 25 + "px",
    },
  ];
  const circlePositions = [
    {
      left: Math.cos((90 * Math.PI) / 180) * 125 + 125 + "px",
      top: -Math.sin((90 * Math.PI) / 180) * 125 + 125 + "px",
    },

    {
      left: Math.cos((210 * Math.PI) / 180) * 125 + 125 + "px",
      top: -Math.sin((210 * Math.PI) / 180) * 125 + 125 + "px",
    },

    {
      left: Math.cos((330 * Math.PI) / 180) * 125 + 125 + "px",
      top: -Math.sin((330 * Math.PI) / 180) * 125 + 125 + "px",
    },
  ];

  const animationLength = 20;
  const icons = [
    <FontAwesomeIcon key="phoneIcon" icon={faPhone} fontSize={25} />,
    <Image
      key="appleIcon"
      src="/apple-mail-icon.webp"
      width={35}
      height={35}
    />,
    <Image
      key="outlookIcon"
      src="/outlook-icon.png"
      width={28}
      height={28}
      style={{ marginLeft: "-5px" }}
    />,
    <Image key="slackIcon" src="/slack-icon.png" width={28} height={28} />,
    <Image key="gmailIcon" src="/gmail-icon.png" width={26} height={20} />,
    <Image key="teamsIcon" src="/teams-icon.png" width={28} height={28} />,
  ];

  const Icon = (index) => {
    const { left, top } = avatarPositions[index % avatarPositions.length];

    return (
      <Avatar
        variant="plain"
        sx={{
          position: "absolute",
          left: left,
          top: top,
          width: "50px",
          height: "50px",
          zIndex: 4,
          //   transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          animation: `${
            index > 2 ? styles.spinRight : styles.spinLeft
          } ${animationLength}s 0s linear infinite`,
        }}
      >
        {icons[index]}
      </Avatar>
    );
  };

  const Circle = (index) => {
    const { left, top } = circlePositions[index];

    return (
      <Box
        sx={{
          width: "20px",
          height: "20px",
          borderRadius: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.93)",
          border: "1px solid #d7dede",
          zIndex: 4,
          position: "absolute",
          left: left,
          top: top,
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  };

  return (
    <>
      <Typography level="body" variant="neutral" sx={{ fontSize: 20 }}>
        24/7 Support
      </Typography>
      <Typography level="h3" sx={{ fontSize: 55 }}>
        We{"'"}re Here When You Need Us
      </Typography>
      <Box
        sx={{
          width: 880,
          height: 440,
          border: "1px solid #d7dede",
          borderRadius: "10px",
          backgroundColor: "white",
          position: "relative",
          marginTop: "50px",
          zIndex: 3,
        }}
      >
        <Box
          sx={{
            width: "150px",
            height: "150px",
            borderRadius: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 4,
            position: "relative",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <Box
          sx={{
            width: "250px",
            height: "250px",
            borderRadius: "100%",
            backgroundColor: "transparent",
            border: "1px solid #d7dede",
            zIndex: 3,
            position: "absolute",
            left: "150px",
            top: "95px",
            animation: `${styles.spinRight} ${animationLength}s 0s linear infinite`,
          }}
        >
          {circlePositions.map((_, index) => Circle(index))}
          {avatarPositions.map((_, index) => Icon(index))}
        </Box>
        <Box
          sx={{
            width: "250px",
            height: "250px",
            borderRadius: "100%",
            backgroundColor: "transparent",
            border: "1px solid #d7dede",
            zIndex: 3,
            position: "absolute",
            right: "150px",
            top: "95px",
            animation: `${styles.spinLeft} ${animationLength}s 0s linear infinite`,
          }}
        >
          {circlePositions.map((_, index) => Circle(index))}
          {avatarPositions.map((_, index) => Icon(index + 3))}
        </Box>
      </Box>
    </>
  );
}
