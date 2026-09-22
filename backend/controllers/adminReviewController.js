const {
    getAdminReviews
} = require("../services/adminReviewService");


// ========================================
// Get Admin Reviews
// ========================================

async function getAdminReviewsController(
    req,
    res
) {

    try {

        const data =
            await getAdminReviews();


        return res.status(200).json({

            success: true,

            data

        });

    } catch (error) {

        console.error(
            "Get admin reviews controller error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "خطا در دریافت نظرات مشتریان."

        });

    }

}


module.exports = {
    getAdminReviewsController
};