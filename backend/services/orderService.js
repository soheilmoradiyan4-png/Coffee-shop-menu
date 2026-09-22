const crypto = require("crypto");

const supabase = require("../config/supabase");

const {
    notifyNewOrder
} = require("./orderNotificationService");

function generateTrackingCode() {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
}


function normalizeItems(items) {
    if (!Array.isArray(items)) {
        throw new Error(
            "لیست محصولات سفارش نامعتبر است."
        );
    }

    if (items.length === 0) {
        throw new Error(
            "سبد خرید خالی است."
        );
    }

    if (items.length > 50) {
        throw new Error(
            "تعداد محصولات سفارش بیش از حد مجاز است."
        );
    }

    const itemMap = new Map();

    for (const item of items) {
        const productId =
            Number(item.productId);

        const quantity =
            Number(item.quantity);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            throw new Error(
                "شناسه محصول نامعتبر است."
            );
        }

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0 ||
            quantity > 99
        ) {
            throw new Error(
                "تعداد محصول نامعتبر است."
            );
        }

        const previousQuantity =
            itemMap.get(productId) || 0;

        const newQuantity =
            previousQuantity + quantity;

        if (newQuantity > 99) {
            throw new Error(
                "تعداد یک محصول بیش از حد مجاز است."
            );
        }

        itemMap.set(
            productId,
            newQuantity
        );
    }

    return Array.from(
        itemMap.entries()
    ).map(
        ([productId, quantity]) => ({
            productId,
            quantity
        })
    );
}


async function generateUniqueTrackingCode() {
    for (let attempt = 0; attempt < 10; attempt++) {

        const trackingCode =
            generateTrackingCode();

        const { data, error } =
            await supabase
                .from("orders")
                .select("id")
                .eq(
                    "tracking_code",
                    trackingCode
                )
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return trackingCode;
        }
    }

    throw new Error(
        "امکان تولید کد پیگیری وجود ندارد."
    );
}


async function createOrder(orderData) {

    const {
        orderType,
        tableNo,
        customerName,
        note,
        items
    } = orderData;


    // -----------------------------
    // اعتبارسنجی نوع سفارش
    // -----------------------------

    if (
        orderType !== "dine_in" &&
        orderType !== "takeaway"
    ) {
        throw new Error(
            "نوع سفارش نامعتبر است."
        );
    }


    // -----------------------------
    // اعتبارسنجی میز
    // -----------------------------

    let normalizedTableNo = null;

    if (orderType === "dine_in") {

        normalizedTableNo =
            Number(tableNo);

        if (
            !Number.isInteger(
                normalizedTableNo
            ) ||
            normalizedTableNo <= 0 ||
            normalizedTableNo > 999
        ) {
            throw new Error(
                "شماره میز نامعتبر است."
            );
        }
    }


    // -----------------------------
    // نام مشتری
    // -----------------------------

    let normalizedCustomerName =
        null;

    if (
        typeof customerName ===
        "string"
    ) {
        normalizedCustomerName =
            customerName.trim();

        if (
            normalizedCustomerName.length >
            100
        ) {
            throw new Error(
                "نام مشتری بیش از حد مجاز است."
            );
        }

        if (
            normalizedCustomerName === ""
        ) {
            normalizedCustomerName =
                null;
        }
    }


    // -----------------------------
    // توضیحات سفارش
    // -----------------------------

    let normalizedNote = null;

    if (
        typeof note === "string"
    ) {
        normalizedNote =
            note.trim();

        if (
            normalizedNote.length >
            1000
        ) {
            throw new Error(
                "توضیحات سفارش بیش از حد مجاز است."
            );
        }

        if (
            normalizedNote === ""
        ) {
            normalizedNote = null;
        }
    }


    // -----------------------------
    // نرمال‌سازی محصولات
    // -----------------------------

    const normalizedItems =
        normalizeItems(items);


    const productIds =
        normalizedItems.map(
            item => item.productId
        );


    // -----------------------------
    // دریافت قیمت واقعی از دیتابیس
    // -----------------------------

    const {
        data: products,
        error: productsError
    } = await supabase
        .from("products")
        .select(`
            id,
            name,
            price,
            available
        `)
        .in(
            "id",
            productIds
        );


    if (productsError) {
        throw productsError;
    }


    if (
        !products ||
        products.length !== productIds.length
    ) {
        throw new Error(
            "یکی از محصولات سفارش پیدا نشد."
        );
    }


    // -----------------------------
    // بررسی موجود بودن محصولات
    // -----------------------------

    const productMap =
        new Map(
            products.map(
                product => [
                    Number(product.id),
                    product
                ]
            )
        );


    for (const item of normalizedItems) {

        const product =
            productMap.get(
                item.productId
            );

        if (!product) {
            throw new Error(
                "یکی از محصولات سفارش پیدا نشد."
            );
        }

        if (!product.available) {
            throw new Error(
                `محصول «${product.name}» در حال حاضر ناموجود است.`
            );
        }
    }


    // -----------------------------
    // محاسبه مجموع واقعی سفارش
    // -----------------------------

    let total = 0;

    const orderItems =
        normalizedItems.map(
            item => {

                const product =
                    productMap.get(
                        item.productId
                    );

                const unitPrice =
                    Number(product.price);

                const subtotal =
                    unitPrice *
                    item.quantity;

                total += subtotal;

                return {
                    product_id:
                        product.id,

                    product_name:
                        product.name,

                    quantity:
                        item.quantity,

                    unit_price:
                        unitPrice,

                    subtotal
                };
            }
        );


    // -----------------------------
    // تولید کد پیگیری
    // -----------------------------

    const trackingCode =
        await generateUniqueTrackingCode();


    // -----------------------------
    // ساخت سفارش
    // -----------------------------

    const {
        data: createdOrder,
        error: orderError
    } = await supabase
        .from("orders")
        .insert({
            tracking_code:
                trackingCode,

            order_type:
                orderType,

            table_no:
                normalizedTableNo,

            customer_name:
                normalizedCustomerName,

            note:
                normalizedNote,

            status:
                "new",

            total,

            notify_ok:
                false
        })
        .select()
        .single();


    if (orderError) {
        throw orderError;
    }


    // -----------------------------
    // ساخت آیتم‌های سفارش
    // -----------------------------

    const orderItemsWithOrderId =
        orderItems.map(
            item => ({
                ...item,
                order_id:
                    createdOrder.id
            })
        );


    const {
        data: createdItems,
        error: itemsError
    } = await supabase
        .from("order_items")
        .insert(
            orderItemsWithOrderId
        )
        .select();


    if (itemsError) {

        // اگر ساخت آیتم‌ها شکست خورد،
        // سفارش اصلی را هم حذف می‌کنیم.
        await supabase
            .from("orders")
            .delete()
            .eq(
                "id",
                createdOrder.id
            );

        throw itemsError;
    }


    // -----------------------------
    // ارسال اعلان سفارش به Bale
    // -----------------------------

    let notificationResult = {
        success: false,
        group: false,
        admin: false
    };


    try {

        notificationResult =
            await notifyNewOrder(
                createdOrder,
                createdItems
            );


        // فقط نتیجه واقعی ارسال را
        // در دیتابیس ذخیره می‌کنیم.

        await supabase
            .from("orders")
            .update({
                notify_ok:
                    notificationResult.success
            })
            .eq(
                "id",
                createdOrder.id
            );

    } catch (notificationError) {

        console.error(
            "Order notification error:",
            notificationError
        );

        // خطای Bale نباید باعث
        // شکست سفارش مشتری شود.
    }


    return {
        order: {
            ...createdOrder,

            notify_ok:
                notificationResult.success
        },

        items: createdItems,

        notification: {
            success:
                notificationResult.success,

            group:
                notificationResult.group,

            admin:
                notificationResult.admin
        }
    };
}


module.exports = {
    createOrder
};