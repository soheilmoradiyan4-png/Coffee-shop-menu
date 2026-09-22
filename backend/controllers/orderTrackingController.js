const {
    getOrderByTrackingCode
} = require("../services/orderTrackingService");

async function getOrderByTrackingCodeController(
    req,
    res
) {
    try {
        const {
            trackingCode
        } = req.params;

        const order =
            await getOrderByTrackingCode(
                trackingCode
            );

        res.json({
            success: true,
            data: order
        });

    } catch (error) {

        console.error(
            "Get order tracking error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "خطا در دریافت سفارش."
        });
    }
}

module.exports = {
    getOrderByTrackingCodeController
};