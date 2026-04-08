"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHumanizeReview = runHumanizeReview;
const textTools_1 = require("@/lib/textTools");
const humanizeReviewCases_1 = require("@/lib/evals/humanizeReviewCases");
function buildFlags(score) {
    const flags = [];
    if (!score.meaningSafe) {
        flags.push("meaning-risk");
    }
    if (!score.structureSafe) {
        flags.push("too-close-to-source");
    }
    if (score.naturalness < 70) {
        flags.push("rough-style");
    }
    if (score.structuralFreshness < 12) {
        flags.push("weak-restructure");
    }
    if (score.penalties >= 18) {
        flags.push("cleanup-penalties");
    }
    return flags;
}
function runCaseVariant(reviewCase, strength) {
    const outputText = (0, textTools_1.humanizeText)(reviewCase.inputText, reviewCase.tone, reviewCase.mode, strength);
    const score = (0, textTools_1.evaluateHumanizeCandidate)(reviewCase.inputText, outputText);
    return {
        strength,
        outputText,
        outputWordCount: (0, textTools_1.countWords)(outputText),
        score,
        flags: buildFlags(score),
    };
}
function normalizeStrengths(value) {
    if (!value || value.length === 0) {
        return ["light", "medium", "strong"];
    }
    const unique = [...new Set(value)].filter((item) => item === "light" || item === "medium" || item === "strong");
    return unique.length > 0 ? unique : ["light", "medium", "strong"];
}
function runHumanizeReview(strengths) {
    const normalizedStrengths = normalizeStrengths(strengths);
    const cases = humanizeReviewCases_1.HUMANIZE_REVIEW_CASES.map((reviewCase) => ({
        id: reviewCase.id,
        title: reviewCase.title,
        category: reviewCase.category,
        length: reviewCase.length,
        tone: reviewCase.tone,
        mode: reviewCase.mode,
        source: reviewCase.source,
        tags: reviewCase.tags,
        notes: reviewCase.notes,
        detectorObservation: reviewCase.detectorObservation,
        inputText: reviewCase.inputText,
        inputWordCount: (0, textTools_1.countWords)(reviewCase.inputText),
        variants: normalizedStrengths.map((strength) => runCaseVariant(reviewCase, strength)),
    }));
    return {
        generatedAt: new Date().toISOString(),
        caveat: "This internal review view combines heuristic signals with side-by-side examples. Use it to support judgment, not to replace human review.",
        strengths: normalizedStrengths,
        caseCount: cases.length,
        cases,
    };
}
