"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
const server_1 = require("@/lib/supabase/server");
async function getCurrentUser() {
    const { data: { user }, error, } = await server_1.supabaseServer.auth.getUser();
    if (error) {
        throw new Error(error.message);
    }
    return user;
}
