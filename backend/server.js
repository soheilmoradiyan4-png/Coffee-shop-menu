require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");

const {
    publicApiLimiter,
    orderLimiter,
    trackingLimiter,
    adminLoginLimiter
} = require("./middleware/rateLimitMiddleware");

const adminAuthRoutes =
    require("./routes/adminAuthRoutes");

const env =
    require("./config/env");

const productRoutes =
    require("./routes/productRoutes");

const categoryRoutes =
    require("./routes/categoryRoutes");

const orderRoutes =
    require("./routes/orderRoutes");

const orderTrackingRoutes =
    require("./routes/orderTrackingRoutes");

const adminOrderRoutes =
    require("./routes/adminOrderRoutes");

const adminCategoryRoutes =
    require("./routes/adminCategoryRoutes");

const adminProductRoutes =
    require("./routes/adminProductRoutes");

const reviewRoutes =
    require("./routes/reviewRoutes");

const adminReviewRoutes =
    require("./routes/adminReviewRoutes");


const app = express();


// ================================
// Security
// ================================

app.disable("x-powered-by");

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);


// ================================
// Session
// ================================

app.use(
    session({
        secret: env.sessionSecret,

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,

            secure:
                env.nodeEnv === "production",

            sameSite: "lax",

            maxAge:
                1000 * 60 * 60 * 8
        }
    })
);


// ================================
// Body Parser
// ================================

app.use(
    express.json({
        limit: "100kb"
    })
);


// ================================
// API Routes
// ================================

app.get("/api", (req, res) => {

    res.json({
        success: true,
        message:
            `${env.cafeName} API is running ☕`
    });

});


app.use(
    "/api/products",
    publicApiLimiter,
    productRoutes
);

app.use(
    "/api/categories",
    publicApiLimiter,
    categoryRoutes
);


app.use(
    "/api/orders",
    orderLimiter,
    orderRoutes
);


app.use(
    "/api/admin/orders",
    adminOrderRoutes
);


app.use(
    "/api/order-tracking",
    trackingLimiter,
    orderTrackingRoutes
);


app.use(
    "/api/admin/auth/login",
    adminLoginLimiter
);

app.use(
    "/api/admin/auth",
    adminAuthRoutes
);


app.use(
    "/api/admin/categories",
    adminCategoryRoutes
);


app.use(
    "/api/admin/products",
    adminProductRoutes
);


app.use(
    "/api/reviews",
    reviewRoutes
);


app.use(
    "/api/admin/reviews",
    adminReviewRoutes
);


// ================================
// Frontend
// ================================

const frontendPath =
    path.join(
        __dirname,
        "..",
        "frontend"
    );


app.use(
    express.static(frontendPath)
);


// ================================
// Start Server
// ================================

app.listen(
    env.port,
    () => {

        console.log(
            `Server running on http://localhost:${env.port}`
        );

    }
);