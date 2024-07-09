"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Avatar } from "@mui/joy";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import styles from "../css/AccuracyChart.module.css";
import AnimatedNumbers from "react-animated-numbers";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import CloudIcon from "@mui/icons-material/Cloud";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";

import StadiumIcon from "@mui/icons-material/Stadium";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CelebrationIcon from "@mui/icons-material/Celebration";

import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import FactoryIcon from "@mui/icons-material/Factory";
import WarehouseIcon from "@mui/icons-material/Warehouse";

// import { config } from "@fortawesome/fontawesome-svg-core";
// import "@fortawesome/fontawesome-svg-core/styles.css";
// config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faGifts,
  faSleigh,
  faMenorah,
  faTemperatureEmpty,
  faTemperatureQuarter,
  faTemperatureHalf,
  faTemperatureThreeQuarters,
  faTemperatureFull,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";

export default function RadarChart() {
  const lineWidths = [200, 280, 200, 280, 200, 280, 200, 280];
  const avatarPositions = [
    { left: "107%", top: "-30px" },
    { left: "-30px", top: "-30px" },
    { left: "-30px", top: "107%" },
    { left: "107%", top: "107%" },
    { left: "50%", top: "-30px" },
    { left: "-30px", top: "50%" },
    { left: "50%", top: "107%" },
    { left: "107%", top: "50%" },
  ];
  const icons = [
    [
      <FontAwesomeIcon
        key="giftIcon"
        icon={faGift}
        color="red"
        fontSize={16}
      />,
      <FontAwesomeIcon
        key="giftsIcon"
        icon={faGifts}
        color="red"
        fontSize={16}
      />,
      <FontAwesomeIcon
        key="sleighIcon"
        icon={faSleigh}
        color="red"
        fontSize={16}
      />,
      <FontAwesomeIcon
        key="menorahIcon"
        icon={faMenorah}
        color="blue"
        fontSize={16}
      />,
    ],

    [
      <ThunderstormIcon key="thunderstormIcon" sx={{ color: "darkblue" }} />,
      <AcUnitIcon key="acUnitIcon" sx={{ color: "blue" }} />,
      <WbSunnyIcon key="sunnyIcon" sx={{ color: "orange" }} />,
      <CloudIcon key="cloudIcon" sx={{ color: "grey" }} />,
    ],
    [
      <AttachMoneyIcon key="moneyIcon" sx={{ color: "green" }} />,
      <AccountBalanceIcon key="balanceIcon" sx={{ color: "grey" }} />,
    ],
    [
      <LocalShippingIcon key="shippingIcon" />,
      <InventoryIcon key="inventoryIcon" />,
    ],
    [
      <StadiumIcon key="stadiumIcon" sx={{ color: "red" }} />,
      <ConfirmationNumberOutlinedIcon key="confirmationIcon" />,
      <EmojiEventsIcon key="eventIcon" sx={{ color: "gold" }} />,
      <CelebrationIcon key="celebrationIcon" sx={{ color: "orange" }} />,
    ],
    [
      <PrecisionManufacturingIcon
        key="manufacturingIcon"
        sx={{ color: "grey" }}
      />,
      <FactoryIcon key="factoryIcon" sx={{ color: "grey" }} />,
      <WarehouseIcon key="warehouseIcon" sx={{ color: "grey" }} />,
    ],
    [
      <FontAwesomeIcon
        key="tempEmptyIcon"
        icon={faTemperatureEmpty}
        color="blue"
        fontSize={18}
      />,
      <FontAwesomeIcon
        key="tempQuarterIcon"
        icon={faTemperatureQuarter}
        color="blue"
        fontSize={18}
      />,
      <FontAwesomeIcon
        key="tempHalfIcon"
        icon={faTemperatureHalf}
        color="orange"
        fontSize={18}
      />,
      <FontAwesomeIcon
        key="tempThreeQuarterIcon"
        icon={faTemperatureThreeQuarters}
        color="red"
        fontSize={18}
      />,
      <FontAwesomeIcon
        key="tempFullIcon"
        icon={faTemperatureFull}
        color="red"
        fontSize={18}
      />,
    ],
    [
      <FontAwesomeIcon
        key="igIcon"
        icon={faInstagram}
        color="purple"
        fontSize={20}
      />,
      <FontAwesomeIcon
        key="twitterIcon"
        icon={faTwitter}
        color="blue"
        fontSize={20}
      />,
      <FontAwesomeIcon
        key="facebookIcon"
        icon={faFacebook}
        color="blue"
        fontSize={20}
      />,
    ],
  ];
  const animationLength = 6;
  const [oldNum, setOldNum] = useState([0, 0, 0, 0]);
  const [num, setNum] = useState([3, 0, 0, 0]);
  const [percent, setPercent] = useState(0);

  const [animationCycleKey, setAnimationCycleKey] = useState(0);
  const totalAnimationCycle = avatarPositions.length * animationLength * 1000;
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationCycleKey((prevKey) => prevKey + 1); // Increment key to re-trigger animations
      setNum([3, 0, 0, 0]);
      setPercent(0);
    }, totalAnimationCycle);
    return () => clearTimeout(timer);
  }, [animationCycleKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextNumber =
        parseInt(num.join("")) + Math.floor(Math.random() * 500 - 250);
      const nextNumberArray = Array.from(String(nextNumber), Number);
      setPercent(Math.floor((nextNumber / 3000) * 100) - 100);
      setOldNum(num.slice());
      setNum(nextNumberArray);
    }, animationLength * 1000);

    return () => clearInterval(timer);
  }, [num]);

  const Icon = (index) => {
    const { left, top } = avatarPositions[index];
    const animationDelay = index * animationLength;

    return (
      <Avatar
        key={animationCycleKey}
        variant="plain"
        sx={{
          position: "absolute",
          zIndex: 2,
          left: left,
          top: top,
          opacity: 0,
          transform: "translate(-50%, -50%)",
          animation: `${styles.moveAndDisappear} ${animationLength}s ${animationDelay}s linear forwards`,
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {icons[index][Math.floor(Math.random() * icons[index].length)]}
      </Avatar>
    );
  };

  const Line = ({ angle, width }) => (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        height: "1px",
        width: width + "px",
        backgroundColor: "rgb(222, 225, 225)",
        transformOrigin: "left",
        transform: `rotate(${angle}deg)`,
        zIndex: 1,
      }}
    />
  );

  return (
    <Box
      sx={{
        width: 440,
        height: 440,
        marginLeft: "30px",
        backgroundColor: "white",
        border: "1px solid #d7dede",
        borderRadius: "10px",
        padding: "5px",
        backgroundColor: "rgb(249, 251, 254)",
        position: "relative", // Important for positioning the lines absolutely
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "150px",
          height: "150px",
          borderRadius: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.93)",
          //   backdropFilter: "blur(100px)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 4,
          position: "relative", // This keeps the lines beneath the text
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography sx={{ paddingTop: "26px", marginBottom: "0px", zIndex: 5 }}>
          Forecasted
        </Typography>
        <AnimatedNumbers
          //   includeComma
          className={styles.container}
          transitions={(index) => ({
            type:
              oldNum.length === num.length && oldNum[index] === num[index]
                ? "keyframes"
                : "keyframes",
            duration: (index + 1) * 0.5,
          })}
          animateToNumber={parseInt(num.join(""))}
          fontStyle={{
            fontSize: 40,
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,
          }}
        />
        <Typography
          variant="soft"
          color={percent < 0 ? "danger" : "success"}
          startDecorator={
            percent < 0 ? (
              <SouthEastIcon fontSize="small" />
            ) : (
              <NorthEastIcon fontSize="small" />
            )
          }
          sx={{ borderRadius: "12px", padding: "5px", marginTop: "3px" }}
        >
          <AnimatedNumbers
            className={styles.container}
            transitions={(index) => ({
              type:
                oldNum.length === num.length && oldNum[index] === num[index]
                  ? "keyframes"
                  : "keyframes",
              duration: (index + 1) * 0.5,
            })}
            animateToNumber={percent}
          />
          %
        </Typography>
      </Box>
      {Array.from({ length: 8 }).map((_, index) => (
        <Line key={index} angle={index * 45} width={lineWidths[index]} />
      ))}
      {avatarPositions.map((position, index) => Icon(index))}
    </Box>
  );
}
