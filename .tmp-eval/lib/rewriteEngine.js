"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteEngine = rewriteEngine;
const aiClient_1 = require("@/lib/aiClient");
const promptBuilder_1 = require("@/lib/promptBuilder");
const textTools_1 = require("@/lib/textTools");
const documentService_1 = require("@/lib/documentService");
const quotaService_1 = require("@/lib/quotaService");
async function rewriteEngine({ tool, inputText, tone = "natural", mode = "standard", wordCount, title = "Untitled Document", documentId, userId, strength = "medium", }) {
    const quota = await (0, quotaService_1.assertRewriteQuota)(userId);
    let sourceInput = inputText;
    let outputText = inputText;
    if (tool === "humanize") {
        const prepared = (0, textTools_1.prepareHumanizeInput)(inputText);
        sourceInput = prepared.cleaned;
        outputText = (0, textTools_1.humanizeText)(sourceInput, tone, mode, strength);
    }
    else {
        outputText = await (0, aiClient_1.processTextWithAI)({
            tool,
            inputText: sourceInput,
            tone,
            mode,
            wordCount,
            strength,
            systemPrompt: (0, promptBuilder_1.buildSystemPrompt)(),
            userInstruction: (0, promptBuilder_1.buildUserInstruction)({
                tool,
                tone,
                mode,
                wordCount,
                strength,
            }),
        });
        if (!outputText.trim()) {
            switch (tool) {
                case "paraphrase":
                    outputText = (0, textTools_1.paraphraseText)(sourceInput, tone, mode, strength);
                    break;
                case "rewrite":
                    outputText = (0, textTools_1.rewriteText)(sourceInput, tone, mode, strength);
                    break;
                case "improve":
                    outputText = (0, textTools_1.improveText)(sourceInput, tone, mode, strength);
                    break;
                case "expand":
                    outputText = (0, textTools_1.expandText)(sourceInput, tone, mode, strength);
                    break;
                case "shorten":
                    outputText = (0, textTools_1.shortenText)(sourceInput, tone, mode, strength);
                    break;
                case "grammar":
                    outputText = (0, textTools_1.grammarText)(sourceInput);
                    break;
                case "humanize":
                    outputText = (0, textTools_1.humanizeText)(sourceInput, tone, mode, strength);
                    break;
            }
        }
    }
    const finalWordCount = (0, textTools_1.countWords)(outputText);
    const humanScore = (0, textTools_1.estimateHumanScore)(sourceInput, outputText, tool, strength);
    const notes = (0, textTools_1.buildProcessingNotes)(tool, tone, mode, strength);
    const savedDoc = await (0, documentService_1.saveDocument)({
        id: documentId || undefined,
        userId: userId || null,
        title,
        inputText: sourceInput,
        outputText,
        tool,
        tone,
        mode,
        wordCount: finalWordCount || wordCount || 0,
        humanScore,
    });
    const finalDocumentId = savedDoc === null || savedDoc === void 0 ? void 0 : savedDoc.id;
    if (finalDocumentId) {
        const existingVersions = await (0, documentService_1.getDocumentVersions)(finalDocumentId);
        const nextVersionNumber = ((existingVersions === null || existingVersions === void 0 ? void 0 : existingVersions.length) || 0) + 1;
        await (0, documentService_1.saveDocumentVersion)({
            documentId: finalDocumentId,
            versionNumber: nextVersionNumber,
            inputText: sourceInput,
            outputText,
            tool,
            tone,
            mode,
            wordCount: finalWordCount || wordCount || 0,
            humanScore,
        });
    }
    await (0, documentService_1.logUsage)({
        userId: userId || null,
        tool,
        wordCount: finalWordCount || wordCount || 0,
    });
    return {
        success: true,
        tool,
        outputText,
        tone,
        mode,
        wordCount: finalWordCount,
        humanScore,
        notes,
        documentId: finalDocumentId,
        quota: (0, quotaService_1.getPostRewriteQuota)(quota),
    };
}
