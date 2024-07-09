"use client";

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/joy/Box";

export default function DynamicLinesBox({ children }) {
  const [contentWidth, setContentWidth] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) {
      setContentWidth(boxRef.current.offsetWidth);
    }
  }, []);

  const generateBackground = (boxWidth) => {
    const lineWidth = 1;
    const lineSpacing = 200;
    boxWidth -= lineSpacing;

    let totalLines = Math.floor(boxWidth / (lineSpacing + lineWidth));
    let remainingSpace = boxWidth - totalLines * (lineSpacing + lineWidth);

    let gradient = [];
    let i = lineSpacing + remainingSpace / 2;

    while (i < boxWidth) {
      gradient.push(`#d7dede ${i}px, #d7dede ${i + lineWidth}px`);
      i += lineWidth;
      gradient.push(
        `transparent ${i}px, transparent ${
          i + Math.min(lineSpacing, boxWidth - i)
        }px`
      );
      i += Math.min(lineSpacing, boxWidth - i);
    }
    return `linear-gradient(to right, transparent ${
      lineSpacing + remainingSpace / 2
    }px, ${gradient.join(", ")})`;
  };

  return (
    <Box
      ref={boxRef}
      sx={{
        maxWidth: "max-content",
        margin: "auto",
        // background:
        //   contentWidth > 0 ? generateBackground(contentWidth) : "none",
      }}
    >
      {children}
    </Box>
  );
}
