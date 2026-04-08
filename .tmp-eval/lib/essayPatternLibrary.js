"use strict";
/**
 * Generic essay-pattern replacements.
 *
 * Purpose:
 * - breaks common school-essay phrasing that detectors often flag
 * - keeps meaning close while changing template-like wording
 * - works well for topics like technology, education, health, environment, society
 *
 * How to use:
 * - import ESSAY_PATTERN_REPLACEMENTS into textTools.ts
 * - apply these before the normal PHRASE_REPLACEMENTS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESSAY_PATTERN_REPLACEMENTS = void 0;
exports.ESSAY_PATTERN_REPLACEMENTS = [
    [/\bhas become an important part of\b/gi, "now plays an important role in"],
    [/\bcontinues to change the way people\b/gi, "continues to shape how people"],
    [/\bin recent years\b/gi, "in recent years"],
    [/\bimproved access to information\b/gi, "made information easier to access"],
    [/\bmade everyday tasks faster and easier\b/gi, "made daily tasks quicker and easier"],
    [/\bsupports both personal and professional activities\b/gi, "supports both personal and professional tasks"],
    [/\bas a result\b/gi, "so"],
    [/\bare becoming more dependent on\b/gi, "now rely more on"],
    [/\bfor efficiency and growth\b/gi, "for efficiency and growth"],
    [/\bone major benefit of\b/gi, "one clear benefit of"],
    [/\bpeople can now connect instantly\b/gi, "people can now connect almost instantly"],
    [/\bregardless of distance\b/gi, "no matter the distance"],
    [/\bstore important data securely\b/gi, "store important data safely"],
    [/\bto improve their knowledge\b/gi, "to build their knowledge"],
    [/\bcreated more opportunities for innovation and global connection\b/gi, "opened more opportunities for innovation and global connection"],
    [/\bhowever\b/gi, "still"],
    [/\bbrings certain challenges that need attention\b/gi, "also brings challenges that deserve attention"],
    [/\bhave become more common in the digital age\b/gi, "have become more common in the digital era"],
    [/\bit is important for users to\b/gi, "users need to"],
    [/\bdevelop responsible habits\b/gi, "build responsible habits"],
    [/\boffers many advantages when used wisely\b/gi, "offers many benefits when used wisely"],
    [/\bwill continue to shape the future of society\b/gi, "will continue to influence the future of society"],
    [/\bin many powerful ways\b/gi, "in many significant ways"],
    // Extra generic essay patterns
    [/\bplays an important role in modern life\b/gi, "plays a major role in modern life"],
    [/\bhas changed the way people\b/gi, "has reshaped how people"],
    [/\bfrom online education to mobile banking and remote work\b/gi, "from online learning to mobile banking and remote work"],
    [/\bpeople and organizations\b/gi, "people and businesses"],
    [/\bimproved communication\b/gi, "better communication"],
    [/\bserve customers\b/gi, "support customers"],
    [/\bcomplete online research\b/gi, "do research online"],
    [/\bglobal connection\b/gi, "global connectivity"],
    [/\bprivacy risks\b/gi, "privacy concerns"],
    [/\bscreen addiction\b/gi, "screen dependence"],
    [/\bmisinformation\b/gi, "false information"],
    [/\buse technology safely\b/gi, "use technology in a safe and responsible way"],
    [/\bpowerful ways\b/gi, "important ways"],
    // Template-style openings
    [/\bone key advantage of\b/gi, "one clear advantage of"],
    [/\bone important benefit of\b/gi, "one major benefit of"],
    [/\bit is clear that\b/gi, "clearly,"],
    [/\bit is obvious that\b/gi, "clearly,"],
    [/\bit is undeniable that\b/gi, "clearly,"],
    [/\bin today'?s world\b/gi, "today"],
    [/\bin the modern world\b/gi, "today"],
    [/\boverall\b/gi, "overall"],
    [/\bin conclusion\b/gi, "overall"],
    [/\bto conclude\b/gi, "overall"],
];
