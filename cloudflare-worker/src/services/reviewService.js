const supabase = require("../config/supabase");


/* =========================================
   Validation
========================================= */

function validateTrackingCode(trackingCode) {

    if (
        typeof trackingCode !== "string" ||
        !/^\d{6}$/.test(trackingCode)
    ) {
        throw new Error(
            "کد پیگیری باید یک کد ۶ رقمی باشد."
        );
    }

    return trackingCode;
}


function validateRating(rating) {

    const numericRating =
        Number(rating);

    if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
    ) {
        throw new Error(
            "امتیاز باید عددی بین ۱ تا ۵ باشد."
        );
    }

    return numericRating;
}


function validateComment(comment) {

    if (
        comment === undefined ||
        comment === null ||
        comment === ""
    ) {
        return null;
    }


    if (typeof comment !== "string") {

        throw new Error(
            "متن نظر نامعتبر است."
        );
    }


    const cleanComment =
        comment.trim();


    if (!cleanComment) {
        return null;
    }


    if (cleanComment.length > 1000) {

        throw new Error(
            "متن نظر نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد."
        );
    }


    return cleanComment;
}


/* =========================================
   Find Order
========================================= */

async function findOrderByTrackingCode(
    trackingCode
) {

    const cleanTrackingCode =
        validateTrackingCode(
            trackingCode
        );


    const { data, error } =
        await supabase
            .from("orders")
            .select(`
                id,
                tracking_code,
                status
            `)
            .eq(
                "tracking_code",
                cleanTrackingCode
            )
            .maybeSingle();


    if (error) {

        throw new Error(
            "خطا در دریافت سفارش."
        );
    }


    if (!data) {

        throw new Error(
            "سفارشی با این کد پیگیری پیدا نشد."
        );
    }


    return data;
}


/* =========================================
   Get Review
========================================= */

async function getReviewByTrackingCode(
    trackingCode
) {

    const order =
        await findOrderByTrackingCode(
            trackingCode
        );


    const { data, error } =
        await supabase
            .from("reviews")
            .select(`
                id,
                order_id,
                rating,
                comment,
                created_at
            `)
            .eq(
                "order_id",
                order.id
            )
            .maybeSingle();


    if (error) {

        throw new Error(
            "خطا در دریافت نظر سفارش."
        );
    }


    return {
        orderId: order.id,
        trackingCode:
            order.tracking_code,
        orderStatus:
            order.status,
        reviewed:
            Boolean(data),
        review:
            data || null
    };
}


/* =========================================
   Create Review
========================================= */

async function createReview(
    trackingCode,
    reviewData
) {

    const order =
        await findOrderByTrackingCode(
            trackingCode
        );


    /*
        فقط سفارش تحویل‌شده
        امکان ثبت Review دارد.
    */

    if (order.status !== "done") {

        throw new Error(
            "فقط برای سفارش‌های تحویل‌شده امکان ثبت نظر وجود دارد."
        );
    }


    const rating =
        validateRating(
            reviewData.rating
        );


    const comment =
        validateComment(
            reviewData.comment
        );


    /*
        بررسی Review قبلی
    */

    const { data: existingReview,
            error: existingReviewError } =
        await supabase
            .from("reviews")
            .select("id")
            .eq(
                "order_id",
                order.id
            )
            .maybeSingle();


    if (existingReviewError) {

        throw new Error(
            "خطا در بررسی نظر قبلی سفارش."
        );
    }


    if (existingReview) {

        throw new Error(
            "برای این سفارش قبلاً نظر ثبت شده است."
        );
    }


    /*
        ایجاد Review
    */

    const { data, error } =
        await supabase
            .from("reviews")
            .insert({
                order_id:
                    order.id,

                rating,

                comment
            })
            .select(`
                id,
                order_id,
                rating,
                comment,
                created_at
            `)
            .single();


    if (error) {

        /*
            Unique constraint:
            هر order فقط یک Review
        */

        if (
            error.code === "23505"
        ) {

            throw new Error(
                "برای این سفارش قبلاً نظر ثبت شده است."
            );
        }


        throw new Error(
            "ثبت نظر انجام نشد."
        );
    }


    return {
        orderId:
            order.id,

        trackingCode:
            order.tracking_code,

        orderStatus:
            order.status,

        review:
            data
    };
}


module.exports = {
    getReviewByTrackingCode,
    createReview
};