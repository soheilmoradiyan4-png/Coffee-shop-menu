/*
    ورودی اصلی بک‌اند روی Cloudflare Workers.
    معادل backend/server.js نسخه‌ی Express، با Hono بازنویسی شده.

    فرق‌های اصلی نسبت به نسخه‌ی Express:
      - به‌جای app.listen، یک fetch handler صادر می‌کنیم (خود Cloudflare
        اجراش می‌کنه، نیازی به listen نیست).
      - به‌جای express-session از کوکی امضاشده استفاده می‌کنیم
        (src/lib/session.js + src/middleware/adminAuth.js).
      - به‌جای express-rate-limit از Cloudflare Rate Limiting binding
        استفاده می‌کنیم (src/middleware/rateLimit.js).
      - این Worker فقط API رو سرو می‌کنه؛ فایل‌های استاتیک فرانت‌اند
        باید جدا روی Cloudflare Pages باشن (توضیحات کامل در README.md).
*/

import { Hono } from "hono";
import { cors } from "hono/cors";

const { initEnv } = require("./config/env");
const { initSupabase } = require("./config/supabaseClient");
const env = require("./config/env");

const {
    publicApiLimiter,
    orderLimiter,
    trackingLimiter,
    adminLoginLimiter
} = require("./middleware/rateLimit");

const { requireAdmin } = require("./middleware/adminAuth");

const { getCategoriesController } = require("./controllers/categoryController");
const { getProductsController } = require("./controllers/productController");
const { createOrderController } = require("./controllers/orderController");
const { getOrderByTrackingCodeController } = require("./controllers/orderTrackingController");
const { getReviewController, createReviewController } = require("./controllers/reviewController");

const {
    loginController,
    logoutController,
    meController
} = require("./controllers/adminAuthController");

const {
    getCategoriesController: getAdminCategoriesController,
    createCategoryController,
    updateCategoryController,
    deleteCategoryController
} = require("./controllers/adminCategoryController");

const {
    getOrdersController: getAdminOrdersController,
    updateOrderStatusController
} = require("./controllers/adminOrderController");

const {
    getProductsController: getAdminProductsController,
    createProductController,
    updateProductController,
    deleteProductController
} = require("./controllers/adminProductController");

const { getAdminReviewsController } = require("./controllers/adminReviewController");


const app = new Hono();


// ================================
// آماده‌سازی env و supabase برای هر request
// ================================

app.use("*", async (c, next) => {
    initEnv(c.env);
    initSupabase(c.env);
    await next();
});


// ================================
// امنیت / هدرها
// ================================

app.use("*", async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
});


// ================================
// CORS
//
// اگه فرانت‌اند و این Worker روی یک دامنه (مثلاً از طریق فایل
// frontend/_redirects که در README توضیح داده شده) سرو بشن، اصلاً
// به CORS نیازی نیست. این بخش فقط برای حالتیه که مستقیماً از یک
// ساب‌دامنه‌ی جدا (مثل PUBLIC_URL) به این Worker درخواست بزنید.
// ================================

app.use("*", async (c, next) => {
    const allowedOrigins = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        env.publicUrl
    ].filter(Boolean);

    const corsMiddleware = cors({
        origin: (origin) => {
            if (allowedOrigins.includes(origin)) {
                return origin;
            }

            return allowedOrigins[0];
        },
        credentials: true
    });

    return corsMiddleware(c, next);
});


// ================================
// Health check
// ================================

app.get("/api", (c) => {
    return c.json({
        success: true,
        message: `${env.cafeName} API is running ☕`
    });
});


// ================================
// Public routes
// ================================

app.get("/api/products", publicApiLimiter, getProductsController);
app.get("/api/categories", publicApiLimiter, getCategoriesController);

app.post("/api/orders", orderLimiter, createOrderController);

app.get("/api/order-tracking/:trackingCode", trackingLimiter, getOrderByTrackingCodeController);

app.get("/api/reviews/:trackingCode", getReviewController);
app.post("/api/reviews/:trackingCode", createReviewController);


// ================================
// Admin auth
// ================================

app.post("/api/admin/auth/login", adminLoginLimiter, loginController);
app.post("/api/admin/auth/logout", logoutController);
app.get("/api/admin/auth/me", meController);


// ================================
// Admin categories
// ================================

app.use("/api/admin/categories/*", requireAdmin);
app.get("/api/admin/categories", requireAdmin, getAdminCategoriesController);
app.post("/api/admin/categories", requireAdmin, createCategoryController);
app.patch("/api/admin/categories/:id", requireAdmin, updateCategoryController);
app.delete("/api/admin/categories/:id", requireAdmin, deleteCategoryController);


// ================================
// Admin orders
// ================================

app.get("/api/admin/orders", requireAdmin, getAdminOrdersController);
app.patch("/api/admin/orders/:id/status", requireAdmin, updateOrderStatusController);


// ================================
// Admin products
// ================================

app.get("/api/admin/products", requireAdmin, getAdminProductsController);
app.post("/api/admin/products", requireAdmin, createProductController);
app.patch("/api/admin/products/:id", requireAdmin, updateProductController);
app.delete("/api/admin/products/:id", requireAdmin, deleteProductController);


// ================================
// Admin reviews
// ================================

app.get("/api/admin/reviews", requireAdmin, getAdminReviewsController);


// ================================
// 404
// ================================

app.notFound((c) => {
    return c.json({
        success: false,
        message: "مسیر موردنظر پیدا نشد."
    }, 404);
});


// ================================
// خطای کلی
// ================================

app.onError((error, c) => {

    console.error("Unhandled worker error:", error);

    return c.json({
        success: false,
        message: "خطای داخلی سرور."
    }, 500);
});

export default app;