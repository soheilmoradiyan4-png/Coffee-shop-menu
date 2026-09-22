const {
    getOrders,
    updateOrderStatus
} = require(
    "../services/adminOrderService"
);


async function getOrdersController(
    req,
    res
) {

    try {

        const {
            status
        } = req.query;

        const orders =
            await getOrders({
                status
            });

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {

        console.error(
            "Get admin orders error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "خطا در دریافت سفارش‌ها."
        });
    }
}


async function updateOrderStatusController(
    req,
    res
) {

    try {

        const {
            id
        } = req.params;

        const {
            status
        } = req.body;


        const order =
            await updateOrderStatus(
                id,
                status
            );


        res.json({
            success: true,
            message:
                "وضعیت سفارش با موفقیت تغییر کرد.",
            data: order
        });

    } catch (error) {

        console.error(
            "Update order status error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "خطا در تغییر وضعیت سفارش."
        });
    }
}


module.exports = {
    getOrdersController,
    updateOrderStatusController
};