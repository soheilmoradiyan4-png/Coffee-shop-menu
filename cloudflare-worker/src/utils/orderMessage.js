function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("fa-IR");
}


function formatOrderType(order) {

    if (order.order_type === "dine_in") {

        return `حضوری - میز ${order.table_no}`;
    }


    if (order.order_type === "takeaway") {

        return "بیرون‌بر";
    }


    return "نامشخص";
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "نامشخص";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "نامشخص";
    }


    return new Intl.DateTimeFormat(
        "fa-IR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


function buildOrderMessage(
    order,
    items
) {

    const customerName =
        order.customer_name ||
        "ثبت نشده";


    const orderItems =
        Array.isArray(items)
            ? items
            : [];


    const itemsText =
        orderItems.length > 0

            ? orderItems
                .map(item => {

                    const subtotal =
                        formatPrice(
                            item.subtotal
                        );

                    return (
                        `• ${item.product_name} × ` +
                        `${item.quantity} — ` +
                        `${subtotal} تومان`
                    );
                })
                .join("\n")

            : "موردی ثبت نشده";


    const note =
        order.note ||
        "بدون توضیحات";


    return [
        "🔔 سفارش جدید",
        "",
        "☕ سفارش جدید کافه",
        "",
        `🧾 کد پیگیری: ${order.tracking_code}`,
        `👤 مشتری: ${customerName}`,
        `🍽 نوع سفارش: ${formatOrderType(order)}`,
        "",
        "📦 اقلام سفارش:",
        itemsText,
        "",
        `💰 مبلغ کل: ${formatPrice(order.total)} تومان`,
        "",
        `📝 توضیحات: ${note}`,
        "",
        `🕐 زمان ثبت: ${formatDate(order.created_at)}`
    ].join("\n");
}


module.exports = {
    buildOrderMessage
};