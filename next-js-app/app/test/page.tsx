"use client";
import React from "react";
import PdfViewer from "./PdfViewer";

const PdfViewerPage = () => {
  const pdfPath = "/test-invoice-1078.pdf";

  return (
    <div>
      {/* <h1>PDF Viewer</h1> */}
      <PdfViewer pdfPath={pdfPath} />
    </div>
  );
};

export default PdfViewerPage;
