/*
    نگهدارنده‌ی واقعی کلاینت Supabase.
    initSupabase(env) یک بار در ابتدای هر request صدا زده می‌شه
    (idempotent - اگه قبلاً ساخته شده باشه دوباره نمی‌سازتش، چون
    مقادیر secret بین request های یک دیپلوی ثابت هستن).
*/

const { createClient } = require("@supabase/supabase-js");

const state = {
    client: null
};

function initSupabase(env) {

    if (!state.client) {

        state.client = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_KEY
        );
    }

    return state.client;
}

function getClient() {

    if (!state.client) {
        throw new Error(
            "Supabase client هنوز initialize نشده. initSupabase(env) باید قبل از هر استفاده صدا زده بشه."
        );
    }

    return state.client;
}

module.exports = {
    initSupabase,
    getClient
};
