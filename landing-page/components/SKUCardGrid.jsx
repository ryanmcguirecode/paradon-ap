"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Card, Sheet, Typography } from "@mui/joy";
import LiquorOutlinedIcon from "@mui/icons-material/LiquorOutlined";
import ToysOutlinedIcon from "@mui/icons-material/ToysOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import CarRepairOutlinedIcon from "@mui/icons-material/CarRepairOutlined";
import DinnerDiningOutlinedIcon from "@mui/icons-material/DinnerDiningOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import LaptopMacOutlinedIcon from "@mui/icons-material/LaptopMacOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import NaturePeopleOutlinedIcon from "@mui/icons-material/NaturePeopleOutlined";
import CoffeeMakerOutlinedIcon from "@mui/icons-material/CoffeeMakerOutlined";
import BlenderOutlinedIcon from "@mui/icons-material/BlenderOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import SportsBasketballOutlinedIcon from "@mui/icons-material/SportsBasketballOutlined";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import WatchOutlinedIcon from "@mui/icons-material/WatchOutlined";
import PianoOutlinedIcon from "@mui/icons-material/PianoOutlined";
import ChairOutlinedIcon from "@mui/icons-material/ChairOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import BackpackOutlinedIcon from "@mui/icons-material/BackpackOutlined";
import ChildFriendlyOutlinedIcon from "@mui/icons-material/ChildFriendlyOutlined";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import ShowerOutlinedIcon from "@mui/icons-material/ShowerOutlined";
import styles from "../css/SkuGrid.module.css";

const skus = [
  { name: "Gin", category: "Liquor", icon: <LiquorOutlinedIcon /> },
  { name: "Whiskey", category: "Liquor", icon: <LiquorOutlinedIcon /> },
  { name: "Puzzle", category: "Toys", icon: <ExtensionOutlinedIcon /> },
  { name: "Race Car", category: "Toys", icon: <ToysOutlinedIcon /> },
  {
    name: "Brake Pads",
    category: "Car Parts",
    icon: <CarRepairOutlinedIcon />,
  },
  {
    name: "Air Filter",
    category: "Car Parts",
    icon: <CarRepairOutlinedIcon />,
  },
  {
    name: "Croissant",
    category: "Food",
    icon: <BakeryDiningOutlinedIcon />,
  },
  {
    name: "Pasta",
    category: "Food",
    icon: <DinnerDiningOutlinedIcon />,
  },
  {
    name: "T-Shirt",
    category: "Clothes",
    icon: <CheckroomOutlinedIcon />,
  },
  {
    name: "Jeans",
    category: "Clothes",
    icon: <CheckroomOutlinedIcon />,
  },
  {
    name: "Laptop",
    category: "Electronics",
    icon: <LaptopMacOutlinedIcon />,
  },
  {
    name: "Smartphone",
    category: "Electronics",
    icon: <SmartphoneOutlinedIcon />,
  },
  {
    name: "Notebook",
    category: "Stationery",
    icon: <BookOutlinedIcon />,
  },
  {
    name: "Ballpoint Pens",
    category: "Stationery",
    icon: <BookOutlinedIcon />,
  },
  {
    name: "Lawn Mower",
    category: "Garden Tools",
    icon: <YardOutlinedIcon />,
  },
  {
    name: "Pruning Shears",
    category: "Garden Tools",
    icon: <YardOutlinedIcon />,
  },
  {
    name: "Fishing Rod",
    category: "Outdoor Gear",
    icon: <NaturePeopleOutlinedIcon />,
  },
  {
    name: "Camping Tent",
    category: "Outdoor Gear",
    icon: <NaturePeopleOutlinedIcon />,
  },
  {
    name: "Coffee Maker",
    category: "Home Appliances",
    icon: <CoffeeMakerOutlinedIcon />,
  },
  {
    name: "Blender",
    category: "Home Appliances",
    icon: <BlenderOutlinedIcon />,
  },
  {
    name: "Soccer Ball",
    category: "Sports Equipment",
    icon: <SportsSoccerOutlinedIcon />,
  },
  {
    name: "Basketball",
    category: "Sports Equipment",
    icon: <SportsBasketballOutlinedIcon />,
  },
  {
    name: "Dog Food",
    category: "Pet Supplies",
    icon: <PetsOutlinedIcon />,
  },
  {
    name: "Cat Litter",
    category: "Pet Supplies",
    icon: <PetsOutlinedIcon />,
  },
  {
    name: "Sunglasses",
    category: "Accessories",
    icon: <WatchOutlinedIcon />,
  },
  {
    name: "Watch",
    category: "Accessories",
    icon: <WatchOutlinedIcon />,
  },
  {
    name: "Guitar",
    category: "Musical Instruments",
    icon: <PianoOutlinedIcon />,
  },
  {
    name: "Drum Set",
    category: "Musical Instruments",
    icon: <PianoOutlinedIcon />,
  },
  {
    name: "Desk Lamp",
    category: "Home Decor",
    icon: <ChairOutlinedIcon />,
  },
  {
    name: "Throw Pillow",
    category: "Home Decor",
    icon: <ChairOutlinedIcon />,
  },
  {
    name: "Yoga Mat",
    category: "Fitness",
    icon: <FitnessCenterOutlinedIcon />,
  },
  {
    name: "Dumbbells",
    category: "Fitness",
    icon: <FitnessCenterOutlinedIcon />,
  },
  {
    name: "Umbrella",
    category: "Outdoor Accessories",
    icon: <BeachAccessOutlinedIcon />,
  },
  {
    name: "Backpack",
    category: "Outdoor Accessories",
    icon: <BackpackOutlinedIcon />,
  },
  {
    name: "Baby Diapers",
    category: "Baby Care",
    icon: <ChildFriendlyOutlinedIcon />,
  },
  {
    name: "Baby Formula",
    category: "Baby Care",
    icon: <ChildFriendlyOutlinedIcon />,
  },
  {
    name: "Tool Set",
    category: "DIY Supplies",
    icon: <HandymanOutlinedIcon />,
  },
  {
    name: "Paint Brushes",
    category: "DIY Supplies",
    icon: <BrushOutlinedIcon />,
  },
  {
    name: "Neck Pillow",
    category: "Travel Accessories",
    icon: <FlightOutlinedIcon />,
  },
  {
    name: "Passport Holder",
    category: "Travel Accessories",
    icon: <FlightOutlinedIcon />,
  },
  {
    name: "Towels",
    category: "Bathroom Accessories",
    icon: <ShowerOutlinedIcon />,
  },
  {
    name: "Shower Gel",
    category: "Bathroom Accessories",
    icon: <ShowerOutlinedIcon />,
  },
];

const colors = [
  "#FFADAD",
  "#FFD6A5",
  "#FDFFB6",
  "#E4F1EE",
  "#D9EDF8",
  "#DEDAF4",
];

function SKUCard({ width }) {
  const [empty, setEmpty] = useState(true);
  const [animationDelay, setAnimationDelay] = useState(Math.random() * 10);
  const [skuIndex, setSkuIndex] = useState(
    Math.floor(Math.random() * skus.length)
  );
  const [colorIndex, setColorIndex] = useState(
    Math.floor(Math.random() * colors.length)
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setEmpty(!empty); // Schedule the toggle of 'empty' after the animation and delay
      setAnimationDelay(0); // Reset delay to zero for the next animation
      setSkuIndex(Math.floor(Math.random() * skus.length)); // Randomize the SKU index
      setColorIndex(Math.floor(Math.random() * colors.length)); // Randomize the color index
    }, (animationDelay + 2) * 1000 + (empty ? 0 : 10000)); // Total duration + pause

    return () => clearTimeout(timeoutId);
  }, [empty, animationDelay]);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "130px",
        width: width + "px",
        borderRadius: "15px",
        overflow: "hidden", // Ensures that contents that might overflow are clipped
      }}
    >
      {/* Render contents only when not empty */}
      {!empty && (
        <Box
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // Apply animation regardless of the empty state
            animation: `${styles.fadeIn} 2s ease ${animationDelay}s 1, ${
              styles.fadeOut
            } 2s ease ${animationDelay + (empty ? 0 : 10)}s 1`,
          }}
        >
          <Sheet
            variant="soft"
            sx={{
              display: "flex",
              flex: 1,
              height: "40px",
              width: "90px",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "15px",
              borderRadius: "40px",
              backgroundColor: colors[colorIndex],
            }}
          >
            {skus[skuIndex].icon}
          </Sheet>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              justifyContent: "flex-end",
              marginBottom: "-5px",
              textAlign: "center",
            }}
          >
            <Typography level="title-sm">{skus[skuIndex].name}</Typography>
            <Typography level="body-xs">{skus[skuIndex].category}</Typography>
          </Box>
        </Box>
      )}
    </Card>
  );
}

export default function SKUCardGrid() {
  const cardWidth = 130;
  const gap = 20;

  const containerRef = useRef(null); // Ref for the container element
  const [numCards, setNumCards] = useState(0); // Initially set to 8 or any appropriate default

  // Function to calculate number of cards based on container width
  const calculateNumberOfCards = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth; // Get the current width of the container
      const cardsPerRow = Math.floor(containerWidth / (cardWidth + gap)); // Calculate maximum cards per row
      setNumCards(cardsPerRow - 1);
    }
  };

  useEffect(() => {
    calculateNumberOfCards();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", calculateNumberOfCards);
      return () => {
        window.removeEventListener("resize", calculateNumberOfCards);
      };
    }
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        // backgroundColor: "rgba(241, 249, 253, 0.4)",
        alignItems: "center",
      }}
    >
      <Typography level="body" variant="neutral" sx={{ fontSize: 20 }}>
        The Problem
      </Typography>
      <Typography
        level="h3"
        sx={{ fontSize: 55, maxWidth: "800px", textAlign: "center" }}
      >
        Forecasting is Hard
      </Typography>
      <Typography level="body" sx={{ fontSize: 24, paddingTop: "12px" }}>
        Especially with millions of SKUs and dynamic markets
      </Typography>
      <Box
        sx={{
          paddingTop: "40px",
        }}
      >
        <Box className={styles.blurGradient}>
          <Box
            sx={{
              display: "flex",
              gap: gap + "px",
            }}
          >
            {Array.from({
              length: numCards,
            }).map((_, index) => (
              <SKUCard key={index} width={cardWidth} />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: "20px", paddingTop: "20px" }}>
            {Array.from({
              length: numCards,
            }).map((_, index) => (
              <SKUCard key={index} width={cardWidth} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
