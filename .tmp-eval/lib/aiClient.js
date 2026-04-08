"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTextWithAI = processTextWithAI;
const openai_1 = __importDefault(require("openai"));
const promptBuilder_1 = require("@/lib/promptBuilder");
const textTools_1 = require("@/lib/textTools");
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new openai_1.default({ apiKey }) : null;
function runMock(tool, inputText, tone = "natural", mode = "standard", strength = "medium") {
    if (tool === "humanize")
        return (0, textTools_1.humanizeText)(inputText, tone, mode, strength);
    if (tool === "rewrite")
        return (0, textTools_1.rewriteText)(inputText, tone, mode, strength);
    if (tool === "paraphrase")
        return (0, textTools_1.paraphraseText)(inputText, tone, mode, strength);
    if (tool === "improve")
        return (0, textTools_1.improveText)(inputText, tone, mode, strength);
    if (tool === "expand")
        return (0, textTools_1.expandText)(inputText, tone, mode, strength);
    if (tool === "shorten")
        return (0, textTools_1.shortenText)(inputText, tone, mode, strength);
    return (0, textTools_1.grammarText)(inputText);
}
async function processTextWithAI({ tool, inputText, tone = "natural", mode = "standard", wordCount, strength = "medium", systemPrompt, userInstruction, }) {
    var _a;
    if (!openai) {
        return runMock(tool, inputText, tone, mode, strength);
    }
    const finalSystemPrompt = systemPrompt ||
        (tool === "humanize" ? (0, promptBuilder_1.buildHumanizeSystemPrompt)() : (0, promptBuilder_1.buildSystemPrompt)());
    let finalUserInstruction = userInstruction ||
        (tool === "humanize"
            ? (0, promptBuilder_1.buildHumanizeTaskPrompt)({
                tone,
                mode,
                wordCount,
                strength,
            })
            : (0, promptBuilder_1.buildUserInstruction)({
                tool,
                tone,
                mode,
                wordCount,
                strength,
            }));
    if (wordCount && wordCount > 0 && !finalUserInstruction.includes("around")) {
        finalUserInstruction += ` Try to keep the output around ${wordCount} words.`;
    }
    try {
        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "system",
                    content: finalSystemPrompt,
                },
                {
                    role: "user",
                    content: `${finalUserInstruction}\n\n<SOURCE_TEXT>\n${inputText}\n</SOURCE_TEXT>`,
                },
            ],
        });
        const outputText = (_a = response.output_text) === null || _a === void 0 ? void 0 : _a.trim();
        if (!outputText) {
            return runMock(tool, inputText, tone, mode, strength);
        }
        return outputText;
    }
    catch (_b) {
        return runMock(tool, inputText, tone, mode, strength);
    }
}
