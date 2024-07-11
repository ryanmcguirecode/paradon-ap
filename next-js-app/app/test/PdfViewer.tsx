"use client";
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack.mjs";
import { Box, Button, IconButton, Toolbar } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";

const initialAnnotations = [
  {
    coordinates: [0.9767, 1.9313, 1.9574, 2.1151],
    page: 2,
    value: "PO BOX 961001",
  },
  {
    coordinates: [7.6596, 8.0463, 0.8355, 0.974],
    page: 4,
    value: 56683,
  },
  {
    coordinates: [7.5402, 8.1562, 10.1979, 10.3411],
    page: 3,
    value: 1676.43,
  },
];

const PdfViewer = ({ pdfPath }) => {
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [annotations] = useState(initialAnnotations);
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(pdfPath).promise;
      setPdfDoc(pdf);
      renderAllPages(pdf, scale, rotation);
    };

    loadPdf();
  }, [pdfPath]);

  useEffect(() => {
    if (pdfDoc) {
      renderAllPages(pdfDoc, scale, rotation);
    }
  }, [scale, rotation, showAnnotations]);

  const renderAllPages = async (pdf, scale, rotation) => {
    if (pdf) {
      const container = containerRef.current;
      container.innerHTML = ""; // Clear existing content

      for (let num = 1; num <= pdf.numPages; num++) {
        const page = await pdf.getPage(num);
        const viewport = page.getViewport({ scale, rotation });

        const pageContainer = document.createElement("div");
        pageContainer.style.position = "relative";
        pageContainer.style.marginBottom = "20px";

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.display = "block"; // Ensure each canvas is a block element

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const overlayCanvas = document.createElement("canvas");
        overlayCanvas.height = viewport.height;
        overlayCanvas.width = viewport.width;
        overlayCanvas.style.position = "absolute";
        overlayCanvas.style.top = "0";
        overlayCanvas.style.left = "0";
        overlayCanvas.style.pointerEvents = "none"; // Ensure the overlay does not interfere with user interactions

        pageContainer.appendChild(canvas);
        pageContainer.appendChild(overlayCanvas);
        container.appendChild(pageContainer);

        const renderTask = page.render(renderContext);
        await renderTask.promise;

        if (showAnnotations) {
          drawAnnotations(
            overlayCanvas.getContext("2d"),
            annotations,
            viewport,
            num,
            scale,
            rotation
          );
        }
      }
    }
  };

  const drawAnnotations = (
    context,
    annotations,
    viewport,
    pageNum,
    scale,
    rotation
  ) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.strokeStyle = "rgb(255, 0, 0)";
    context.fillStyle = "rgba(255, 0, 0, 0.5)";

    context.save();

    annotations.forEach((annotation) => {
      if (annotation.page === pageNum) {
        let [x, y, width, height] = transformCoordinates(
          annotation.coordinates,
          viewport,
          rotation,
          scale
        );

        context.fillRect(x, y, width, height);
      }
    });

    context.restore();
  };

  const transformCoordinates = (coords, viewport, rotation, scale) => {
    const [x1, x2, y1, y2] = coords.map((coord) => coord * 72 * scale); // Convert to points and apply scale
    let x, y, width, height;

    if (rotation < 0) {
      rotation += 360;
    }
    switch (rotation) {
      case 90:
        x = viewport.width - y2;
        y = x1;
        width = y2 - y1;
        height = x2 - x1;
        break;
      case 180:
        x = viewport.width - x2;
        y = viewport.height - y2;
        width = x2 - x1;
        height = y2 - y1;
        break;
      case 270:
        x = y1;
        y = viewport.height - x2;
        width = y2 - y1;
        height = x2 - x1;
        break;
      default: // 0 degrees
        x = x1;
        y = y1;
        width = x2 - x1;
        height = y2 - y1;
        break;
    }

    return [x, y, width, height];
  };

  const toggleAnnotations = () => {
    setShowAnnotations(!showAnnotations);
  };

  const handleZoomIn = () => {
    setScale(scale + 0.1);
  };

  const handleZoomOut = () => {
    setScale(scale - 0.1);
  };

  const handleRotateLeft = () => {
    setRotation((rotation - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((rotation + 90) % 360);
  };

  return (
    <div>
      <Toolbar>
        <IconButton onClick={handleZoomIn}>
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={handleZoomOut}>
          <ZoomOutIcon />
        </IconButton>
        <IconButton onClick={handleRotateLeft}>
          <RotateLeftIcon />
        </IconButton>
        <IconButton onClick={handleRotateRight}>
          <RotateRightIcon />
        </IconButton>
        <Button
          variant="contained"
          onClick={toggleAnnotations}
          style={{ marginLeft: "auto" }}
        >
          {showAnnotations ? "Hide" : "Show"} Annotations
        </Button>
      </Toolbar>
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: "calc(100vh - 64px)", // Adjust height to leave space for toolbar
          overflowY: "scroll",
          overflowX: "hidden",
          position: "relative",
        }}
      />
    </div>
  );
};

export default PdfViewer;
