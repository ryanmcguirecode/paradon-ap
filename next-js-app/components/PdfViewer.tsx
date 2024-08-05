"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
  Input,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import AutoFixOffIcon from "@mui/icons-material/AutoFixOff";
import RemoveIcon from "@mui/icons-material/Remove";
import * as pdfjsLib from "pdfjs-dist/webpack.mjs";
import Rotate90DegreesCwOutlinedIcon from "@mui/icons-material/Rotate90DegreesCwOutlined";
import Document, { DetectedField } from "@/types/Document";
import { DocumentConfigField } from "@/types/DocumentConfig";

const ZOOM_CHANGE = 0.1;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.25;

interface PdfViewerProps {
  arrayBuffer: ArrayBuffer | null;
  doc?: Document;
  fields?: DocumentConfigField[];
  activeField?: DocumentConfigField | null;
  activeDetectedField?: DetectedField | null;
  scrollTo?: any;
}

const PdfViewer = ({
  arrayBuffer,
  doc,
  fields,
  activeField,
  activeDetectedField,
  scrollTo = null,
}: PdfViewerProps) => {
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [scale, setScale] = useState(0);
  const [inputZoom, setInputZoom] = useState<string>("100");
  const [rotation, setRotation] = useState(0);
  const [annotations, setAnnotations] = useState([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const [fitMode, setFitMode] = useState("height");
  const [pdfOverflow, setPdfOverflow] = useState(false);
  const overlayCanvasRefs = useRef([]);
  const scrollPositionRef = useRef(0);
  const observerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {}, [doc, fields]);

  useEffect(() => {
    if (!arrayBuffer) {
      return;
    }
    arrayBuffer = arrayBuffer.slice(0);
    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const container = containerRef.current;
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const initialScale = (container.clientWidth * 0.9) / viewport.width;
      setScale(initialScale);
      setPdfDoc(pdf);
      setInputZoom(Math.floor(initialScale * 100).toString());
    };

    loadPdf();
  }, [arrayBuffer]);

  useEffect(() => {
    if (!doc || !fields) {
      return;
    }
    const rectangles = [];
    for (const field of fields) {
      if (!field.modelField || !doc.detectedFields[field.modelField]) continue;

      const coordinates = doc.detectedFields[field.modelField].coordinates;
      const page = doc.detectedFields[field.modelField].page;
      const color = field.color;
      if (!coordinates || !page || !color) {
        continue;
      }

      const opacity = !activeField || activeField.id === field.id ? 0.4 : 0.05;

      rectangles.push({
        coordinates,
        page,
        color: `rgba(${color.join(",")}, ${opacity})`,
      });
    }
    setAnnotations(rectangles);
  }, [doc, fields, activeField]);

  useEffect(() => {
    if (pdfDoc) {
      renderAnnotations();
    }
  }, [showAnnotations]);

  useEffect(() => {
    if (!pdfDoc || scale === 0) {
      return;
    }
    const renderAllPages = async () => {
      const container = containerRef.current;
      scrollPositionRef.current = container.scrollTop; // Save scroll position
      container.innerHTML = ""; // Clear existing content

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
            setInputPage(pageIndex.toString());
          }
        });
      }, observerOptions);

      const overlayCanvases = [];
      const pageElements = [];

      for (let num = 1; num <= pdfDoc.numPages; num++) {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale, rotation });

        const pageContainer = document.createElement("div");
        pageContainer.style.position = "relative";
        pageContainer.style.marginBottom = "20px";
        pageContainer.style.paddingTop = num === 1 ? "5px" : "0";
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
        overlayCanvas.style.paddingTop = num === 1 ? "5px" : "0";
        overlayCanvas.style.pointerEvents = "none";

        const animationCanvas = document.createElement("canvas");
        animationCanvas.height = viewport.height;
        animationCanvas.width = viewport.width;
        animationCanvas.style.position = "absolute";
        animationCanvas.style.top = "0";
        animationCanvas.style.left = "0";
        animationCanvas.style.paddingTop = num === 1 ? "5px" : "0";
        animationCanvas.style.pointerEvents = "none";

        const animationContext = animationCanvas.getContext("2d");

        pageContainer.appendChild(canvas);
        pageContainer.appendChild(overlayCanvas);
        pageContainer.appendChild(animationCanvas);

        pageElements.push({
          page,
          pageContainer,
          renderContext,
          overlayCanvas,
          animationCanvas,
        });
      }

      pageElements.forEach(
        async (
          {
            page,
            pageContainer,
            renderContext,
            overlayCanvas,
            animationCanvas,
          },
          num
        ) => {
          container.appendChild(pageContainer);

          const renderTask = page.render(renderContext);
          await renderTask.promise;

          overlayCanvases.push(overlayCanvas);

          drawAnnotations(
            overlayCanvas.getContext("2d"),
            annotations,
            renderContext.viewport,
            num + 1,
            scale,
            rotation
          );

          if (num + 1 === activeDetectedField?.page) {
            startAnimation(
              animationCanvas.getContext("2d"),
              renderContext.viewport
            );
          }

          observerRef.current.observe(pageContainer); // Observe the page container
        }
      );

      overlayCanvasRefs.current = overlayCanvases;

      // Check if the PDF overflows the container
      if (pdfDoc && containerRef.current) {
        pdfDoc.getPage(1).then((page) => {
          const viewport = page.getViewport({ scale: scale, rotation });
          const overflow = containerRef.current.clientWidth / viewport.width;
          setPdfOverflow(overflow < 1);
        });
      }

      container.scrollTop = scrollPositionRef.current; // Restore scroll position
    };

    renderAllPages();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pdfDoc, scale, rotation, annotations]);

  useEffect(() => {
    if (
      !scrollTo ||
      !scrollTo.coordinates ||
      !scrollTo.page ||
      !containerRef.current
    ) {
      return;
    }

    const container = containerRef.current;
    const viewport = container.getBoundingClientRect();

    const coordinates = transformCoordinates(
      scrollTo.coordinates,
      viewport,
      rotation,
      scale
    );

    // Calculate the total height of all pages up to the target page
    let totalHeight = 0;
    for (let i = 0; i < scrollTo.page - 1; i++) {
      totalHeight += container.children[i].offsetHeight + 20; // Including margin-bottom
    }

    // Add the offset within the target page
    const offsetInPage = coordinates[1];
    let targetScrollTop = totalHeight + offsetInPage;

    // Center the target coordinates in the middle of the view
    const containerHeight = container.clientHeight;
    targetScrollTop =
      targetScrollTop - containerHeight / 2 + coordinates[3] / 2;

    const targetScrollLeft =
      coordinates[0] - container.clientWidth / 2 + coordinates[2] / 2;

    // Custom smooth scrolling function
    const smoothScrollTop = (target, duration) => {
      const start = container.scrollTop;
      const change = target - start;
      const startTime = performance.now();

      const easeInOutQuad = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };

      const animateScroll = (currentTime) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        container.scrollTop = start + change * easeInOutQuad(progress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    };

    const smoothScrollLeft = (target, duration) => {
      const start = container.scrollLeft;
      const change = target - start;
      const startTime = performance.now();

      const easeInOutQuad = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };

      const animateScroll = (currentTime) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        container.scrollLeft = start + change * easeInOutQuad(progress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    };

    smoothScrollTop(targetScrollTop, 600);
    smoothScrollLeft(targetScrollLeft, 800);
  }, [scrollTo]);

  const drawAnnotations = (
    context: CanvasRenderingContext2D,
    annotations,
    viewport,
    pageNum: number,
    scale: number,
    rotation: number
  ) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.save();

    annotations.forEach((annotation) => {
      if (annotation.page === pageNum) {
        let [x, y, width, height] = transformCoordinates(
          annotation.coordinates,
          viewport,
          rotation,
          scale
        );
        context.fillStyle = annotation.color;
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

    // let viewportWidth, viewportHeight;
    // if (rotation % 180 !== 0) {
    //   [viewportHeight, viewportWidth] = viewportSize;
    // } else {
    //   [viewportWidth, viewportHeight] = viewportSize;
    // }

    // if (viewport.height === null || viewport.width === null) {
    //   console.error("Viewport size is null");
    //   return [0, 0, 0, 0];
    // }

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

    return [x - 3, y - 3, width + 6, height + 6];
  };

  const toggleAnnotations = () => {
    setShowAnnotations((prev) => !prev);
  };

  const renderAnnotations = async () => {
    overlayCanvasRefs.current.forEach((overlayCanvas, index) => {
      const context = overlayCanvas.getContext("2d");
      const pageNum = index + 1;
      pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale, rotation });
        if (showAnnotations) {
          drawAnnotations(
            context,
            annotations,
            viewport,
            pageNum,
            scale,
            rotation
          );
        } else {
          context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }
      });
    });
  };

  const handleZoomIn = () => {
    handleScaleChange(scale + ZOOM_CHANGE);
  };

  const handleZoomOut = () => {
    handleScaleChange(scale - ZOOM_CHANGE);
  };

  const handleRotateRight = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleInputZoomChange = (event) => {
    const newInputZoom = event.target.value.slice(0, -1);
    const numberOnly = newInputZoom.replace(/[^0-9]/g, "");
    setInputZoom(numberOnly);
  };

  const handleScaleChange = (newScale) => {
    if (newScale < 0.25) {
      newScale = MIN_ZOOM;
    } else if (newScale > 5) {
      newScale = MAX_ZOOM;
    } else if (newScale) {
      setScale(newScale);
      setInputZoom(Math.floor(newScale * 100).toString());
    }
  };

  const fitToWidth = () => {
    const container = containerRef.current;
    if (pdfDoc && container) {
      pdfDoc.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale: 1, rotation });
        const newScale = container.clientWidth / viewport.width;
        handleScaleChange(newScale - 0.02);
      });
    }
  };

  const fitToHeight = () => {
    const container = containerRef.current;
    if (pdfDoc && container) {
      pdfDoc.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale: 1, rotation });
        const newScale = container.clientHeight / viewport.height;
        handleScaleChange(newScale);
      });
    }
  };

  const toggleFitMode = () => {
    if (fitMode === "width") {
      fitToHeight();
      setFitMode("height");
    } else {
      fitToWidth();
      setFitMode("width");
    }
  };

  const handleInputPageChange = (event) => {
    const newPage = event.target.value;
    const numberOnly = newPage.replace(/[^0-9]/g, "");
    setInputPage(numberOnly);
  };

  const handlePageChange = () => {
    var newPage = parseInt(inputPage);
    if (newPage < 1 || !newPage) {
      newPage = 1;
    } else if (newPage > pdfDoc.numPages) {
      newPage = pdfDoc.numPages;
    }

    setInputPage(newPage.toString());
    setCurrentPage(newPage);
    const container = containerRef.current;
    const pageHeight = container.children[0].offsetHeight + 20; // Including margin-bottom
    container.scrollTop = (newPage - 1) * pageHeight;
  };

  const startAnimation = (animationContext, viewport) => {
    if (!activeField || !fields) {
      return;
    }

    const coords = transformCoordinates(
      activeDetectedField.coordinates,
      viewport,
      rotation,
      scale
    );
    const rect = {
      x: coords[0],
      y: coords[1],
      width: coords[2],
      height: coords[3],
    };

    let offset = 0;

    const drawAnimatedBorder = () => {
      animationContext.clearRect(
        0,
        0,
        animationContext.canvas.width,
        animationContext.canvas.height
      );

      const perimeter = 2 * (rect.width + rect.height);
      const dashLength = 0.25 * perimeter; // Each dash is 25% of the perimeter
      const gapLength = 0.25 * perimeter; // Each gap is also 25% of the perimeter

      animationContext.strokeStyle = `rgba(${activeField.color.join(",")}, 1)`;
      animationContext.lineWidth = 1;
      animationContext.setLineDash([
        dashLength,
        gapLength,
        dashLength,
        gapLength,
      ]);
      animationContext.lineDashOffset = -offset;

      animationContext.beginPath();
      animationContext.rect(rect.x, rect.y, rect.width, rect.height);
      animationContext.stroke();

      offset += 0.4; // Adjust speed of animation here
      if (offset > perimeter) {
        offset = 0;
      }

      animationRef.current = requestAnimationFrame(drawAnimatedBorder);
    };

    drawAnimatedBorder();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        marginLeft: "40px",
        marginRight: "40px",
        width: "calc(100% - 80px)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{
          paddingTop: "15px",
          paddingBottom: "18px",
          margin: "auto",
        }}
      >
        <Input
          value={inputPage}
          onChange={handleInputPageChange}
          onBlur={() => handlePageChange()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handlePageChange();
            }
          }}
          slotProps={{ input: { tabIndex: -1 } }}
          sx={{ width: 60, margin: "0 10px" }}
        />
        <Typography>/ {pdfDoc?.numPages}</Typography>
        <Divider orientation="vertical" />
        <IconButton onClick={handleZoomOut} tabIndex={-1}>
          <RemoveIcon />
        </IconButton>
        <Input
          value={inputZoom + "%"}
          onChange={handleInputZoomChange}
          onBlur={() => handleScaleChange(parseFloat(inputZoom) / 100)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleScaleChange(parseFloat(inputZoom) / 100);
            }
          }}
          slotProps={{ input: { tabIndex: -1 } }}
          sx={{ width: 70, margin: "0 10px" }}
        />
        <IconButton onClick={handleZoomIn} tabIndex={-1}>
          <AddIcon />
        </IconButton>
        <Divider orientation="vertical" />
        <IconButton onClick={handleRotateRight} tabIndex={-1}>
          <Rotate90DegreesCwOutlinedIcon />
        </IconButton>
        <IconButton onClick={toggleFitMode} tabIndex={-1}>
          {fitMode === "width" ? (
            <img src="/fit-width-icon.svg" alt="Fit to Width" />
          ) : (
            <img src="/fit-height-icon.svg" alt="Fit to Height" />
          )}
        </IconButton>
        <IconButton onClick={toggleAnnotations} tabIndex={-1}>
          {showAnnotations ? <AutoFixOffIcon /> : <AutoFixNormalIcon />}
        </IconButton>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          backgroundColor: "rgb(224, 225, 227)",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            width: "100%",
            height: "100%", // Ensure the Box takes the full height of its parent
            overflowY: "auto",
            overflowX: "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: !pdfOverflow ? "center" : "", // Center the PDFs
          }}
        />
      </Box>
    </Box>
  );
};

export default PdfViewer;
