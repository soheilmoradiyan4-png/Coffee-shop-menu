const {
    getReviewByTrackingCode,
    createReview
} = require("../services/reviewService");

async function getReviewController(c) {

    try {

        const result = await getReviewByTrackingCode(
            c.req.param("trackingCode")
        );

        return c.json({ success: true, data: result });

    } catch (error) {

        console.error("getReviewController:", error);

        return c.json({
            success: false,
            message: error.message
        }, 400);
    }
}

async function createReviewController(c) {

    try {

        const body = await c.req.json().catch(() => ({}));

        const result = await createReview(
            c.req.param("trackingCode"),
            body
        );

        return c.json({
            success: true,
            message: "نظر شما با موفقیت ثبت شد.",
            data: result
        }, 201);

    } catch (error) {

        console.error("createReviewController:", error);

        return c.json({
            success: false,
            message: error.message
        }, 400);
    }
}

module.exports = {
    getReviewController,
    createReviewController
};
