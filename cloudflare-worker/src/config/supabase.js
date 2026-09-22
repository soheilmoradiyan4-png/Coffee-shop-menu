/*
    این فایل جایگزین config/supabase.js نسخه‌ی Express میشه.
    هدف: بقیه‌ی فایل‌ها (services) دقیقاً مثل قبل بنویسن:

        const supabase = require("../config/supabase");
        supabase.from("orders")...

    بدون اینکه بدونن پشت صحنه یک Proxy هست که هر متد/property رو
    به کلاینت واقعی (که توسط initSupabase ساخته شده) پاس میده.
*/

const { getClient } = require("./supabaseClient");

const supabaseProxy = new Proxy({}, {
    get(_target, prop) {

        const client = getClient();
        const value = client[prop];

        return typeof value === "function"
            ? value.bind(client)
            : value;
    }
});

module.exports = supabaseProxy;
