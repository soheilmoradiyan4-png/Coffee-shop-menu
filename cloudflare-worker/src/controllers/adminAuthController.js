const { setCookie, deleteCookie, getCookie } = require("hono/cookie");

const { loginAdmin } = require("../services/adminAuthService");
const { signSession, verifySession } = require("../lib/session");
const env = require("../config/env");

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 ساعت، مثل نسخه‌ی قبلی

async function loginController(c) {

    try {

        const body = await c.req.json().catch(() => ({}));
        const { email, password } = body;

        const admin = await loginAdmin(email, password);

        if (!admin) {

            return c.json({
                success: false,
                message: "ایمیل یا رمز عبور اشتباه است."
            }, 401);
        }

        const token = await signSession(
            { admin },
            env.sessionSecret,
            SESSION_MAX_AGE_SECONDS
        );

        setCookie(c, "admin_session", token, {
            httpOnly: true,
            secure: env.nodeEnv === "production",
            sameSite: "Lax",
            path: "/",
            maxAge: SESSION_MAX_AGE_SECONDS
        });

        return c.json({
            success: true,
            message: "ورود با موفقیت انجام شد."
        });

    } catch (error) {

        console.error("Admin login error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در ورود مدیر."
        }, 500);
    }
}

function logoutController(c) {

    deleteCookie(c, "admin_session", { path: "/" });

    return c.json({
        success: true,
        message: "با موفقیت خارج شدید."
    });
}

async function meController(c) {

    const token = getCookie(c, "admin_session");

    const payload = token
        ? await verifySession(token, env.sessionSecret)
        : null;

    if (!payload || !payload.admin) {

        return c.json({
            success: false,
            message: "وارد حساب مدیر نشده‌اید."
        }, 401);
    }

    return c.json({
        success: true,
        data: payload.admin
    });
}

module.exports = {
    loginController,
    logoutController,
    meController
};
