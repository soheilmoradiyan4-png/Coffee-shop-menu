const {
    getOrders,
    updateOrderStatus
} = require("../services/adminOrderService");

async function getOrdersController(c) {

    try {

        const status = c.req.query("status");

        const orders = await getOrders({ status });

        return c.json({ success: true, data: orders });

    } catch (error) {

        console.error("Get admin orders error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در دریافت سفارش‌ها."
        }, 400);
    }
}

async function updateOrderStatusController(c) {

    try {

        const id = c.req.param("id");
        const body = await c.req.json().catch(() => ({}));

        const order = await updateOrderStatus(id, body.status);

        return c.json({
            success: true,
            message: "وضعیت سفارش با موفقیت تغییر کرد.",
            data: order
        });

    } catch (error) {

        console.error("Update order status error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در تغییر وضعیت سفارش."
        }, 400);
    }
}

module.exports = {
    getOrdersController,
    updateOrderStatusController
};
