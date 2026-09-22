const rateLimit =
    require("express-rate-limit");


// ================================
// عمومی
// ================================

const publicApiLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 300,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
        }
    });


// ================================
// ثبت سفارش
// ================================

const orderLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 30,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "تعداد درخواست‌های ثبت سفارش بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
        }
    });


// ================================
// Tracking
// ================================

const trackingLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 30,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "تعداد درخواست‌های پیگیری بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
        }
    });


// ================================
// Login مدیر
// ================================

const adminLoginLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 10,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۱۵ دقیقه بعد دوباره تلاش کنید."
        }
    });


module.exports = {
    publicApiLimiter,
    orderLimiter,
    trackingLimiter,
    adminLoginLimiter
};