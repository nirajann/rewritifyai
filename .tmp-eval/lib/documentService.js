"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDocument = saveDocument;
exports.saveDocumentVersion = saveDocumentVersion;
exports.logUsage = logUsage;
exports.getDocumentsByUserId = getDocumentsByUserId;
exports.getDocumentById = getDocumentById;
exports.getDocumentVersions = getDocumentVersions;
exports.renameDocument = renameDocument;
exports.restoreVersionToDocument = restoreVersionToDocument;
exports.deleteDocument = deleteDocument;
const supabase_js_1 = require("@supabase/supabase-js");
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url)
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey)
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    return (0, supabase_js_1.createClient)(url, serviceRoleKey);
}
async function saveDocument({ id, userId, title, inputText, outputText, tool, tone, mode, wordCount, humanScore, }) {
    const supabase = getSupabaseAdmin();
    if (id) {
        const { data, error } = await supabase
            .from("documents")
            .update({
            user_id: userId,
            title,
            input_text: inputText,
            output_text: outputText,
            tool,
            tone,
            mode,
            word_count: wordCount,
            human_score: humanScore,
            updated_at: new Date().toISOString(),
        })
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    const { data, error } = await supabase
        .from("documents")
        .insert({
        user_id: userId,
        title,
        input_text: inputText,
        output_text: outputText,
        tool,
        tone,
        mode,
        word_count: wordCount,
        human_score: humanScore,
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function saveDocumentVersion({ documentId, versionNumber, inputText, outputText, tool, tone, mode, wordCount, humanScore, }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("document_versions")
        .insert({
        document_id: documentId,
        version_number: versionNumber,
        input_text: inputText,
        output_text: outputText,
        tool,
        tone,
        mode,
        word_count: wordCount,
        human_score: humanScore,
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function logUsage({ userId, tool, wordCount, }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("usage_logs")
        .insert({
        user_id: userId,
        tool,
        word_count: wordCount,
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function getDocumentsByUserId(userId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
    if (error)
        throw new Error(error.message);
    return data || [];
}
async function getDocumentById(id) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function getDocumentVersions(documentId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false });
    if (error)
        throw new Error(error.message);
    return data || [];
}
async function renameDocument(id, title) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("documents")
        .update({
        title,
        updated_at: new Date().toISOString(),
    })
        .eq("id", id)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function restoreVersionToDocument(documentId, versionId) {
    const supabase = getSupabaseAdmin();
    const { data: version, error: versionError } = await supabase
        .from("document_versions")
        .select("*")
        .eq("id", versionId)
        .eq("document_id", documentId)
        .single();
    if (versionError)
        throw new Error(versionError.message);
    const { data, error } = await supabase
        .from("documents")
        .update({
        input_text: version.input_text,
        output_text: version.output_text,
        tool: version.tool,
        tone: version.tone,
        mode: version.mode,
        word_count: version.word_count,
        human_score: version.human_score,
        updated_at: new Date().toISOString(),
    })
        .eq("id", documentId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function deleteDocument(id) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("document_versions").delete().eq("document_id", id);
    if (error)
        throw new Error(error.message);
    const { error: docError } = await supabase.from("documents").delete().eq("id", id);
    if (docError)
        throw new Error(docError.message);
    return { success: true };
}
