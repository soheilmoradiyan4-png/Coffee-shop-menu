const { createOrder } = require("../services/orderService");

async function createOrderController(c) {

    try {

        const body = await c.req.json().catch(() => ({}));

        const result = await createOrder(body);

        return c.json({
            success: true,
            message: "سفارش با موفقیت ثبت شد.",
            data: {
                orderId: result.order.id,
                trackingCode: result.order.tracking_code,
                status: result.order.status,
                total: result.order.total
            }
        }, 201);

    } catch (error) {

        console.error("Create order error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در ثبت سفارش."
        }, 400);
    }
}

module.exports = {
    createOrderController
};
