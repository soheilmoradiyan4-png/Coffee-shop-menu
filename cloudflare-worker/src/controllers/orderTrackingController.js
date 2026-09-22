const { getOrderByTrackingCode } = require("../services/orderTrackingService");

async function getOrderByTrackingCodeController(c) {

    try {

        const trackingCode = c.req.param("trackingCode");

        const order = await getOrderByTrackingCode(trackingCode);

        return c.json({ success: true, data: order });

    } catch (error) {

        console.error("Get order tracking error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در دریافت سفارش."
        }, 400);
    }
}

module.exports = {
    getOrderByTrackingCodeController
};
