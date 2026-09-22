/*
    جایگزین middleware/rateLimitMiddleware.js (express-rate-limit).
    از Cloudflare Workers Rate Limiting API استفاده می‌کنه که توی
    wrangler.toml به‌صورت binding تعریف شده (بخش [[ratelimits]]).

    نکته: اگه binding تعریف نشده باشه (مثلاً موقع dev بدون wrangler)،
    میان‌افزار محدودیتی اعمال نمی‌کنه تا کار توسعه مختل نشه.
*/

function makeRateLimiter(bindingName, message) {

    return async function rateLimitMiddleware(c, next) {

        const limiter = c.env[bindingName];

        if (!limiter) {
            await next();
            return;
        }

        const key =
            c.req.header("cf-connecting-ip") ||
            "unknown";

        const { success } = await limiter.limit({ key });

        if (!success) {

            return c.json({
                success: false,
                message
            }, 429);
        }

        await next();
    };
}

module.exports = {

    publicApiLimiter: makeRateLimiter(
        "PUBLIC_API_LIMITER",
        "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
    ),

    orderLimiter: makeRateLimiter(
        "ORDER_LIMITER",
        "تعداد درخواست‌های ثبت سفارش بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
    ),

    trackingLimiter: makeRateLimiter(
        "TRACKING_LIMITER",
        "تعداد درخواست‌های پیگیری بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
    ),

    adminLoginLimiter: makeRateLimiter(
        "ADMIN_LOGIN_LIMITER",
        "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید."
    )
};
