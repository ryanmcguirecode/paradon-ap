"use client";
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import * as pdfjsLib from "pdfjs-dist/webpack.mjs";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import { Input } from "@mui/joy";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(1);
  const overlayCanvasRefs = useRef([]);
  const scrollPositionRef = useRef(0);
  const observerRef = useRef(null);

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
  }, [scale, rotation]);

  useEffect(() => {
    if (overlayCanvasRefs.current.length) {
      toggleAnnotationsOnOverlay();
    }
  }, [showAnnotations]);

  const renderAllPages = async (pdf, scale, rotation) => {
    if (pdf) {
      const container = containerRef.current;
      scrollPositionRef.current = container.scrollTop; // Save scroll position
      container.innerHTML = ""; // Clear existing content
      overlayCanvasRefs.current = []; // Clear overlay canvas refs

      const observerOptions = {
        root: container,
        threshold: [0.5], // Trigger when 50% of the element is visible
      };

      if (observerRef.current) {
        observerRef.current.disconnect(); // Disconnect previous observer if exists
      }

      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(
              (entry.target as HTMLElement).dataset.pageIndex,
              10
            );
            setCurrentPage(pageIndex);
            setInputPage(pageIndex);
          }
        });
      }, observerOptions);

      for (let num = 1; num <= pdf.numPages; num++) {
        const page = await pdf.getPage(num);
        const viewport = page.getViewport({ scale, rotation });

        const pageContainer = document.createElement("div");
        pageContainer.style.position = "relative";
        pageContainer.style.marginBottom = "20px";
        pageContainer.dataset.pageIndex = num.toString();

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

        overlayCanvasRefs.current.push(overlayCanvas);

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

        observerRef.current.observe(pageContainer); // Observe the page container
      }

      container.scrollTop = scrollPositionRef.current; // Restore scroll position
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
    setShowAnnotations((prev) => !prev);
  };

  const toggleAnnotationsOnOverlay = () => {
    overlayCanvasRefs.current.forEach((overlayCanvas, index) => {
      const context = overlayCanvas.getContext("2d");
      const pageNum = index + 1;
      const viewport = pdfDoc
        .getPage(pageNum)
        .then((page) => page.getViewport({ scale, rotation }));

      viewport.then((vp) => {
        if (showAnnotations) {
          drawAnnotations(context, annotations, vp, pageNum, scale, rotation);
        } else {
          context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }
      });
    });
  };

  const handleZoomIn = () => {
    setScale(scale + 0.1);
  };

  const handleZoomOut = () => {
    setScale(scale - 0.1);
  };

  const handleRotateRight = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleScaleChange = (event) => {
    const newScale = parseFloat(event.target.value) / 100;
    if (!isNaN(newScale) && newScale > 0) {
      setScale(newScale);
    }
  };

  const handlePageChange = (event) => {
    const newPage = parseInt(event.target.value, 10);
    if (!isNaN(newPage) && newPage > 0 && newPage <= pdfDoc.numPages) {
      setCurrentPage(newPage);
      setInputPage(newPage);
      const container = containerRef.current;
      const pageHeight = container.children[0].offsetHeight + 20; // Including margin-bottom
      container.scrollTop = (newPage - 1) * pageHeight;
    } else {
      setInputPage(currentPage); // Reset to current page if input is invalid
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{ padding: "10px", margin: "auto" }}
      >
        <Input
          value={inputPage}
          onChange={handlePageChange}
          sx={{ width: 60, margin: "0 10px" }}
        />
        <Typography>/ {pdfDoc?.numPages}</Typography>
        <Divider orientation="vertical" />
        <IconButton onClick={handleZoomOut}>
          <RemoveIcon />
        </IconButton>
        <Input
          value={(scale * 100).toFixed(0)}
          onChange={handleScaleChange}
          sx={{ width: 60, margin: "0 10px" }}
        />
        <IconButton onClick={handleZoomIn}>
          <AddIcon />
        </IconButton>
        <Divider orientation="vertical" />
        <IconButton onClick={handleRotateRight}>
          <RotateRightIcon />
        </IconButton>
        {/* <Button onClick={toggleAnnotations}>
          {showAnnotations ? "Hide" : "Show"} Annotations
        </Button> */}
      </Stack>
      <Box
        sx={{
          backgroundColor: "lightgray",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            height: "calc(100vh - 64px)", // Adjust height to leave space for toolbar
            overflowY: "scroll",
            overflowX: "hidden",
            position: "relative",
          }}
        />
      </Box>
    </Box>
  );
};

export default PdfViewer;
