const { getAdminReviews } = require("../services/adminReviewService");

async function getAdminReviewsController(c) {

    try {

        const data = await getAdminReviews();

        return c.json({ success: true, data });

    } catch (error) {

        console.error("Get admin reviews controller error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در دریافت نظرات مشتریان."
        }, 500);
    }
}

module.exports = {
    getAdminReviewsController
};
