//const API_BASE_URL = "/api";
const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api"
        : "/api";
// ==============================
// Products
// ==============================

async function fetchProducts() {

    const response =
        await fetch(
            `${API_BASE_URL}/products`
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "خطا در دریافت محصولات"
        );

    }


    return result.data;

}


// ==============================
// Categories
// ==============================

async function fetchCategories() {

    const response =
        await fetch(
            `${API_BASE_URL}/categories`
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "خطا در دریافت دسته‌بندی‌ها"
        );

    }


    return result.data;

}


// ==============================
// Orders
// ==============================

async function createOrder(
    orderData
) {

    const response =
        await fetch(
            `${API_BASE_URL}/orders`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        orderData
                    )

            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "خطا در ثبت سفارش"
        );

    }


    return result;

}


// ==============================
// Order Tracking
// ==============================

async function fetchOrderByTrackingCode(
    trackingCode
) {

    const response =
        await fetch(
            `${API_BASE_URL}/order-tracking/${trackingCode}`
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "خطا در دریافت سفارش"
        );

    }


    return result.data;

}


// ==============================
// Reviews
// ==============================

async function fetchReviewByTrackingCode(
    trackingCode
) {

    const response =
        await fetch(
            `${API_BASE_URL}/reviews/${trackingCode}`
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "خطا در دریافت نظر سفارش."
        );

    }


    return result.data;

}


async function createReview(
    trackingCode,
    reviewData
) {

    const response =
        await fetch(
            `${API_BASE_URL}/reviews/${trackingCode}`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        reviewData
                    )

            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "ثبت نظر انجام نشد."
        );

    }


    return result.data;

}