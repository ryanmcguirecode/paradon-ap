"use client";
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack.mjs";
import { Box, Button } from "@mui/material";

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
  const [annotations] = useState(initialAnnotations);
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(pdfPath).promise;
      setPdfDoc(pdf);
      renderAllPages(pdf, scale);
    };

    loadPdf();
  }, [pdfPath]);

  const renderAllPages = async (pdf, scale) => {
    if (pdf) {
      const container = containerRef.current;
      container.innerHTML = ""; // Clear existing content

      for (let num = 1; num <= pdf.numPages; num++) {
        const page = await pdf.getPage(num);
        const viewport = page.getViewport({ scale });

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
            num
          );
        }
      }
    }
  };

  const drawAnnotations = (context, annotations, viewport, pageNum) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.strokeStyle = "rgb(255, 0, 0)";
    context.fillStyle = "rgba(255, 0, 0, 0.5)";

    annotations.forEach((annotation) => {
      if (annotation.page === pageNum) {
        // const [x1, y1, x2, y2] = annotation.coordinates.map(
        //   (coord) => coord * 72
        // );

        const x = annotation.coordinates[0];
        const y = annotation.coordinates[2];
        const width = annotation.coordinates[1] - x;
        const height = annotation.coordinates[3] - y;

        // const rect = viewport.convertToViewportRectangle([x1, y1, x2, y2]);
        // console.log(rect);

        const adjustedRect = [x * 72, y * 72, width * 72, height * 72];
        console.log(adjustedRect);

        context.fillRect(
          adjustedRect[0],
          adjustedRect[1],
          adjustedRect[2],
          adjustedRect[3]
        );
      }
    });
  };

  const toggleAnnotations = () => {
    setShowAnnotations(!showAnnotations);
    const container = containerRef.current;
    const overlayCanvases = container.querySelectorAll("canvas:nth-child(2)");
    overlayCanvases.forEach((canvas) => {
      const context = canvas.getContext("2d");
      if (showAnnotations) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      } else {
        const pageNum =
          Array.from(container.children).indexOf(canvas.parentNode) + 1;
        const viewport = pdfDoc
          .getPage(pageNum)
          .then((page) => page.getViewport({ scale }));
        viewport.then((vp) =>
          drawAnnotations(context, annotations, vp, pageNum)
        );
      }
    });
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={toggleAnnotations}
        style={{ marginBottom: "20px" }}
      >
        {showAnnotations ? "Hide" : "Show"} Annotations
      </Button>
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: "100vh",
          overflowY: "scroll",
          overflowX: "hidden",
          position: "relative",
        }}
      />
    </div>
  );
};

export default PdfViewer;
