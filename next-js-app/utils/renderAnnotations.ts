import { PDFDocument, rgb } from "pdf-lib";
import Document from "@/types/Document";
import { DocumentConfigField } from "@/types/DocumentConfig";

function convertToInches(coordinates: number[]) {
  return coordinates.map((coord) => coord * 72);
}

function reflectY(coordinates: number[], pageHeight: number) {
  const newCoordinates = [...coordinates];
  newCoordinates[2] = pageHeight - coordinates[2];
  newCoordinates[3] = pageHeight - coordinates[3];
  return newCoordinates;
}

function addPadding(coordinates: number[]) {
  return [
    coordinates[0] - 3,
    coordinates[1] + 3,
    coordinates[2] - 3,
    coordinates[3] + 3,
  ];
}

export default function renderAnnotations(
  pdf: PDFDocument,
  document: Document,
  fields: DocumentConfigField[],
  activeField?: string
) {
  if (!pdf || !document || !fields) {
    return;
  }

  for (const field of fields) {
    if (!field.modelField || !document.detectedFields[field.modelField])
      continue;
    let coordinates = document.detectedFields[field.modelField].coordinates;
    let page = document.detectedFields[field.modelField].page;
    if (!coordinates || !page) {
      continue;
    }
    page = page - 1;

    const pages = pdf.getPages();
    coordinates = reflectY(
      addPadding(convertToInches(coordinates)),
      pages[page].getHeight()
    );

    const x = coordinates[0];
    const y = coordinates[2];
    const width = coordinates[1] - x;
    const height = coordinates[3] - y;
    var opacity = 0.5;
    if (activeField) {
      opacity = field.id === activeField ? 0.6 : 0.1;
    }

    pages[page].drawRectangle({
      x: x,
      y: y,
      width: width,
      height: height,
      color: rgb(
        field.color[0] / 255,
        field.color[1] / 255,
        field.color[2] / 255
      ),
      opacity: opacity,
    });
  }
}
