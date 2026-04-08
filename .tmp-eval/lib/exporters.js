"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTextAsPdf = exportTextAsPdf;
exports.exportTextAsDocx = exportTextAsDocx;
const pdf_lib_1 = require("pdf-lib");
const docx_1 = require("docx");
function wrapText(text, maxCharsPerLine = 90) {
    const paragraphs = text.split("\n");
    const lines = [];
    for (const paragraph of paragraphs) {
        const words = paragraph.split(" ");
        let currentLine = "";
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length > maxCharsPerLine) {
                if (currentLine)
                    lines.push(currentLine);
                currentLine = word;
            }
            else {
                currentLine = testLine;
            }
        }
        if (currentLine)
            lines.push(currentLine);
        lines.push("");
    }
    return lines;
}
function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
async function exportTextAsPdf(text, filename = "rewritify-output.pdf") {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
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
        color: (0, pdf_lib_1.rgb)(0.06, 0.1, 0.16),
    });
    y -= 30;
    for (const line of lines) {
        if (y < 50)
            break;
        page.drawText(line, {
            x: 50,
            y,
            size: fontSize,
            font,
            color: (0, pdf_lib_1.rgb)(0.15, 0.2, 0.28),
            maxWidth: width - 100,
        });
        y -= lineHeight;
    }
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
    downloadBlob(new Blob([pdfBuffer], { type: "application/pdf" }), filename);
}
async function exportTextAsDocx(text, filename = "rewritify-output.docx") {
    const doc = new docx_1.Document({
        sections: [
            {
                children: [
                    new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({
                                text: "RewritifyAI Export",
                                bold: true,
                                size: 30,
                            }),
                        ],
                        spacing: { after: 300 },
                    }),
                    ...text.split("\n").map((line) => new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({
                                text: line || " ",
                                size: 24,
                            }),
                        ],
                        spacing: { after: 180 },
                    })),
                ],
            },
        ],
    });
    const blob = await docx_1.Packer.toBlob(doc);
    downloadBlob(blob, filename);
}
