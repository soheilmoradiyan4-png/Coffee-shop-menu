const {
    createOrder
} = require("../services/orderService");


async function createOrderController(
    req,
    res
) {
    try {

        const result =
            await createOrder(
                req.body
            );


        res.status(201).json({
            success: true,

            message:
                "سفارش با موفقیت ثبت شد.",

            data: {
                orderId:
                    result.order.id,

                trackingCode:
                    result.order.tracking_code,

                status:
                    result.order.status,

                total:
                    result.order.total
            }
        });

    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        res.status(400).json({
            success: false,

            message:
                error.message ||
                "خطا در ثبت سفارش."
        });
    }
}


module.exports = {
    createOrderController
};