import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";

function wrapText(text: string, maxCharsPerLine = 90) {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length > maxCharsPerLine) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    lines.push("");
  }

  return lines;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function exportTextAsPdf(
  text: string,
  filename = "rewritify-output.pdf"
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const fontSize = 12;
  const lineHeight = 18;

  let y = height - 50;
  const lines = wrapText(text, 88);

  page.drawText("RewritifyAI Export", {
    x: 50,
    y,
    size: 18,
    font,
    color: rgb(0.06, 0.1, 0.16),
  });

  y -= 30;

  for (const line of lines) {
    if (y < 50) break;

    page.drawText(line, {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0.15, 0.2, 0.28),
      maxWidth: width - 100,
    });

    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
 const pdfBuffer = pdfBytes.buffer.slice(
  pdfBytes.byteOffset,
  pdfBytes.byteOffset + pdfBytes.byteLength
) as ArrayBuffer;

downloadBlob(new Blob([pdfBuffer], { type: "application/pdf" }), filename);
}

export async function exportTextAsDocx(
  text: string,
  filename = "rewritify-output.docx"
) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "RewritifyAI Export",
                bold: true,
                size: 30,
              }),
            ],
            spacing: { after: 300 },
          }),
          ...text.split("\n").map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line || " ",
                    size: 24,
                  }),
                ],
                spacing: { after: 180 },
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}