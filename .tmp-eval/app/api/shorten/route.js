"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const rewriteRoute_1 = require("@/lib/rewriteRoute");
async function POST(req) {
    return (0, rewriteRoute_1.handleRewriteRoute)(req, "shorten");
}
