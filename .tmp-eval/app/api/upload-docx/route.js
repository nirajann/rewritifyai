"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const mammoth_1 = __importDefault(require("mammoth"));
async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof File)) {
            return server_1.NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth_1.default.extractRawText({ buffer });
        return server_1.NextResponse.json({
            success: true,
            text: result.value,
            message: "DOCX uploaded successfully",
        });
    }
    catch (error) {
        return server_1.NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Upload failed",
        }, { status: 500 });
    }
}
