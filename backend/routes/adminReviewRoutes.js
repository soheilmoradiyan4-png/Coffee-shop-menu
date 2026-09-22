const express = require("express");

const {
    getAdminReviewsController
} = require("../controllers/adminReviewController");

const {
    requireAdmin
} = require("../middleware/adminAuthMiddleware");


const router =
    express.Router();


// ========================================
// Admin Reviews
// ========================================

router.get(
    "/",
    requireAdmin,
    getAdminReviewsController
);


module.exports = router;