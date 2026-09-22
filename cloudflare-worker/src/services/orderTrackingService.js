const supabase = require("../config/supabase");

async function getOrderByTrackingCode(trackingCode) {
    if (
        typeof trackingCode !== "string" ||
        !/^\d{6}$/.test(trackingCode)
    ) {
        throw new Error(
            "کد پیگیری باید یک عدد ۶ رقمی باشد."
        );
    }

    const {
        data: order,
        error: orderError
    } = await supabase
        .from("orders")
        .select(`
            id,
            tracking_code,
            order_type,
            table_no,
            customer_name,
            note,
            status,
            total,
            created_at,
            order_items (
                id,
                product_name,
                quantity,
                unit_price,
                subtotal
            )
        `)
        .eq(
            "tracking_code",
            trackingCode
        )
        .maybeSingle();

    if (orderError) {
        throw orderError;
    }

    if (!order) {
        throw new Error(
            "سفارشی با این کد پیگیری پیدا نشد."
        );
    }

    return order;
}

module.exports = {
    getOrderByTrackingCode
};