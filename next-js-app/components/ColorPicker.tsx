import { useState } from "react";
import { RgbColorPicker } from "react-colorful";

import { Box, FormHelperText, Input, Typography } from "@mui/joy";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

interface ColorPickerProps {
  initialColor?: [number, number, number];
  onChange?: (color: [number, number, number]) => void;
  indentation?: number;
  errorFunction?: (value: [number, number, number]) => {
    error: boolean;
    message: string;
  };
}

export default function ColorPicker({
  initialColor = [235, 64, 52],
  onChange = (color: [number, number, number]) => {},
  indentation = 0,
  errorFunction = (color) => ({ error: false, message: "" }),
}: ColorPickerProps) {
  const [color, setColor] = useState({
    r: initialColor[0],
    g: initialColor[1],
    b: initialColor[2],
  });
  const error = errorFunction([color.r, color.g, color.b]);

  return (
    <Box sx={{ marginLeft: indentation * 20 + "px" }}>
      <Typography level="title-sm">Field Color</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        <Box sx={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <Input
            type="number"
            value={color.r}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setColor({ ...color, r: value });
              onChange([value, color.g || 0, color.b || 0]);
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.g}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setColor({ ...color, g: value });
              onChange([color.r || 0, value, color.b || 0]);
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Input
            type="number"
            value={color.b}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setColor({ ...color, b: value });
              onChange([color.r || 0, color.g || 0, value]);
            }}
            sx={{ maxWidth: "75px" }}
          />
          <Box
            sx={{
              width: "36px",
              height: "36px",
              borderRadius: "5px",
              backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
            }}
          />
        </Box>
        {error.error && (
          <FormHelperText sx={{ marginTop: "-10px" }}>
            <InfoOutlined />
            {error.message}
          </FormHelperText>
        )}
        <Box sx={{ marginLeft: "25px", marginBottom: "15px" }}>
          <RgbColorPicker
            color={color}
            onChange={(color) => {
              setColor(color);
              onChange([color.r, color.g, color.b]);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
