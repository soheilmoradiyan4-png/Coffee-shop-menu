const {
    getReviewByTrackingCode,
    createReview
} = require("../services/reviewService");


/* =========================================
   Get Review
========================================= */

async function getReviewController(
    req,
    res
) {

    try {

        const result =
            await getReviewByTrackingCode(
                req.params.trackingCode
            );


        return res.json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "getReviewController:",
            error
        );


        return res.status(400).json({
            success: false,
            message:
                error.message
        });
    }
}


/* =========================================
   Create Review
========================================= */

async function createReviewController(
    req,
    res
) {

    try {

        const result =
            await createReview(
                req.params.trackingCode,
                req.body
            );


        return res.status(201).json({
            success: true,
            message:
                "نظر شما با موفقیت ثبت شد.",
            data: result
        });

    } catch (error) {

        console.error(
            "createReviewController:",
            error
        );


        return res.status(400).json({
            success: false,
            message:
                error.message
        });
    }
}


module.exports = {
    getReviewController,
    createReviewController
};