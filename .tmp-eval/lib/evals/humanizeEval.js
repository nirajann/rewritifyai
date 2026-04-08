"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHumanizeBenchmark = runHumanizeBenchmark;
const textTools_1 = require("@/lib/textTools");
const humanizeBenchmark_1 = require("@/lib/evals/humanizeBenchmark");
function round(value) {
    return Math.round(value * 10) / 10;
}
function average(values) {
    if (values.length === 0)
        return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function buildFlags(score) {
    const flags = [];
    if (!score.meaningSafe) {
        flags.push("meaning-risk");
    }
    if (!score.structureSafe) {
        flags.push("too-close-to-source");
    }
    if (score.naturalness < 60) {
        flags.push("flat-naturalness");
    }
    if (score.structuralFreshness < 12) {
        flags.push("weak-restructure");
    }
    if (score.penalties >= 18) {
        flags.push("cleanup-penalties");
    }
    return flags;
}
function summarizeStrengthRun(strength, cases) {
    return {
        strength,
        averageTotal: round(average(cases.map((item) => item.score.total))),
        averageMeaningPreservation: round(average(cases.map((item) => item.score.meaningPreservation))),
        averageNaturalness: round(average(cases.map((item) => item.score.naturalness))),
        averageStructuralFreshness: round(average(cases.map((item) => item.score.structuralFreshness))),
        averageSimilarity: round(average(cases.map((item) => item.score.similarity))),
        averagePenalties: round(average(cases.map((item) => item.score.penalties))),
        meaningSafeRate: round((cases.filter((item) => item.score.meaningSafe).length / cases.length) * 100),
        structureSafeRate: round((cases.filter((item) => item.score.structureSafe).length / cases.length) * 100),
        flaggedCases: cases
            .filter((item) => item.flags.length > 0)
            .map((item) => item.id),
    };
}
function runSingleCase(benchmarkCase, strength) {
    const outputText = (0, textTools_1.humanizeText)(benchmarkCase.inputText, benchmarkCase.tone, benchmarkCase.mode, strength);
    const score = (0, textTools_1.evaluateHumanizeCandidate)(benchmarkCase.inputText, outputText);
    return {
        id: benchmarkCase.id,
        title: benchmarkCase.title,
        category: benchmarkCase.category,
        length: benchmarkCase.length,
        tone: benchmarkCase.tone,
        mode: benchmarkCase.mode,
        inputWordCount: (0, textTools_1.countWords)(benchmarkCase.inputText),
        outputWordCount: (0, textTools_1.countWords)(outputText),
        outputText,
        score,
        flags: buildFlags(score),
    };
}
function runHumanizeBenchmark(strengths = ["light", "medium", "strong"]) {
    const runs = strengths.map((strength) => {
        const cases = humanizeBenchmark_1.HUMANIZE_BENCHMARK.map((benchmarkCase) => runSingleCase(benchmarkCase, strength));
        return {
            strength,
            summary: summarizeStrengthRun(strength, cases),
            cases,
        };
    });
    return {
        generatedAt: new Date().toISOString(),
        benchmarkVersion: humanizeBenchmark_1.HUMANIZE_BENCHMARK_VERSION,
        caveat: "These scores are heuristic and useful for product iteration, not scientific proof of human quality or detector resistance.",
        caseCount: humanizeBenchmark_1.HUMANIZE_BENCHMARK.length,
        runs,
    };
}
