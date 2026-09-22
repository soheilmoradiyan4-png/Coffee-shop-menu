const requiredEnv = [
    "PORT",
    "CAFE_NAME",
    "NODE_ENV"
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(
            `Missing required environment variable: ${key}`
        );
    }
}

module.exports = {
    port: Number(process.env.PORT),

    cafeName: process.env.CAFE_NAME,

    nodeEnv: process.env.NODE_ENV,

    supabaseUrl:
        process.env.SUPABASE_URL || "",

    supabaseServiceKey:
        process.env.SUPABASE_SERVICE_KEY || "",

    baleBotToken: process.env.BALE_BOT_TOKEN || "",
    baleChatId: process.env.BALE_CHAT_ID || "",
    baleAdminChatId: process.env.BALE_ADMIN_CHAT_ID || "",

    sessionSecret:
        process.env.SESSION_SECRET || "",

    publicUrl:
        process.env.PUBLIC_URL || "",
};