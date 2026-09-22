const supabase = require("../config/supabase");


const ALLOWED_STATUSES = [
    "new",
    "preparing",
    "ready",
    "done",
    "cancelled"
];


async function getOrders(filters = {}) {

    const {
        status
    } = filters;

    let query = supabase
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
            notify_ok,
            created_at,
            updated_at,
            order_items (
                id,
                product_name,
                quantity,
                unit_price,
                subtotal
            )
        `)
        .order(
            "created_at",
            {
                ascending: false
            }
        );

    if (status) {

        if (
            !ALLOWED_STATUSES.includes(
                status
            )
        ) {
            throw new Error(
                "وضعیت سفارش نامعتبر است."
            );
        }

        query = query.eq(
            "status",
            status
        );
    }

    const {
        data,
        error
    } = await query;

    if (error) {
        throw error;
    }

    return data;
}


async function updateOrderStatus(
    orderId,
    newStatus
) {

    const normalizedOrderId =
        Number(orderId);

    if (
        !Number.isInteger(
            normalizedOrderId
        ) ||
        normalizedOrderId <= 0
    ) {
        throw new Error(
            "شناسه سفارش نامعتبر است."
        );
    }


    if (
        !ALLOWED_STATUSES.includes(
            newStatus
        )
    ) {
        throw new Error(
            "وضعیت جدید سفارش نامعتبر است."
        );
    }


    const {
        data,
        error
    } = await supabase
        .from("orders")
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq(
            "id",
            normalizedOrderId
        )
        .select(`
            id,
            tracking_code,
            order_type,
            table_no,
            customer_name,
            note,
            status,
            total,
            notify_ok,
            created_at,
            updated_at
        `)
        .single();


    if (error) {
        throw error;
    }


    return data;
}


module.exports = {
    getOrders,
    updateOrderStatus
};