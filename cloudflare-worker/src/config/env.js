/*
    نسخه‌ی Cloudflare Workers فایل config/env.js

    برخلاف Node.js که process.env همیشه در دسترسه، توی Workers
    مقادیر env فقط داخل fetch handler (یعنی c.env توی Hono) در دسترسن.
    برای همین یک آبجکت واحد می‌سازیم و initEnv(c.env) رو در ابتدای
    هر request (توی src/index.js) صدا می‌زنیم تا این آبجکت پر بشه.
    بقیه فایل‌ها (services/controllers) دقیقاً مثل نسخه‌ی Express
    این فایل رو require می‌کنن و از همون property هایی که همیشه بودن
    استفاده می‌کنن؛ چیزی توی امضای سرویس‌ها عوض نشده.
*/

const envState = {
    cafeName: "Coffee Shop",
    nodeEnv: "production",

    supabaseUrl: "",
    supabaseServiceKey: "",

    baleBotToken: "",
    baleChatId: "",
    baleAdminChatId: "",

    sessionSecret: "",
    publicUrl: ""
};

function initEnv(env) {

    envState.cafeName = env.CAFE_NAME || "Coffee Shop";
    envState.nodeEnv = env.NODE_ENV || "production";

    envState.supabaseUrl = env.SUPABASE_URL || "";
    envState.supabaseServiceKey = env.SUPABASE_SERVICE_KEY || "";

    envState.baleBotToken = env.BALE_BOT_TOKEN || "";
    envState.baleChatId = env.BALE_CHAT_ID || "";
    envState.baleAdminChatId = env.BALE_ADMIN_CHAT_ID || "";

    envState.sessionSecret = env.SESSION_SECRET || "";
    envState.publicUrl = env.PUBLIC_URL || "";

    if (!envState.sessionSecret) {
        console.warn(
            "SESSION_SECRET تنظیم نشده. با دستور `wrangler secret put SESSION_SECRET` یک مقدار تصادفی و طولانی ست کنید."
        );
    }
}

module.exports = envState;
module.exports.initEnv = initEnv;
