const { getCookie } = require("hono/cookie");

const { verifySession } = require("../lib/session");
const env = require("../config/env");

/*
    جایگزین middleware/adminAuthMiddleware.js نسخه‌ی Express.
    به‌جای req.session.admin، کوکی امضاشده رو verify می‌کنیم.
*/

async function requireAdmin(c, next) {

    const token = getCookie(c, "admin_session");

    const payload = token
        ? await verifySession(token, env.sessionSecret)
        : null;

    if (!payload || !payload.admin) {

        return c.json({
            success: false,
            message: "دسترسی غیرمجاز. ابتدا وارد حساب مدیر شوید."
        }, 401);
    }

    c.set("admin", payload.admin);

    await next();
}

module.exports = {
    requireAdmin
};
