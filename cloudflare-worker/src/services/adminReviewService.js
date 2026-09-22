const supabase = require("../config/supabase");


// ========================================
// Get Admin Reviews
// ========================================

async function getAdminReviews() {

    const {
        data,
        error
    } = await supabase
        .from("reviews")
        .select(`
            id,
            order_id,
            rating,
            comment,
            created_at,
            order:orders (
                id,
                tracking_code,
                customer_name,
                order_type,
                table_no,
                status,
                total,
                created_at
            )
        `)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Get admin reviews error:",
            error
        );

        throw new Error(
            "خطا در دریافت نظرات مشتریان."
        );

    }


    const reviews =
        Array.isArray(data)
            ? data
            : [];


    // ========================================
    // Statistics
    // ========================================

    const total =
        reviews.length;


    const ratingSum =
        reviews.reduce(
            (sum, review) =>
                sum +
                Number(review.rating || 0),
            0
        );


    const average =
        total > 0
            ? Number(
                (
                    ratingSum /
                    total
                ).toFixed(1)
            )
            : 0;


    // ========================================
    // Distribution
    // ========================================

    const distribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };


    reviews.forEach(
        review => {

            const rating =
                Number(
                    review.rating
                );


            if (
                rating >= 1 &&
                rating <= 5
            ) {

                distribution[rating]++;

            }

        }
    );


    // ========================================
    // Prepare Review List
    // ========================================

    const formattedReviews =
        reviews.map(
            review => {

                const order =
                    review.order || null;


                return {

                    id:
                        review.id,

                    order_id:
                        review.order_id,

                    rating:
                        review.rating,

                    comment:
                        review.comment,

                    created_at:
                        review.created_at,

                    tracking_code:
                        order
                            ? order.tracking_code
                            : null,

                    customer_name:
                        order
                            ? order.customer_name
                            : null,

                    order_type:
                        order
                            ? order.order_type
                            : null,

                    table_no:
                        order
                            ? order.table_no
                            : null,

                    order_status:
                        order
                            ? order.status
                            : null,

                    order_total:
                        order
                            ? order.total
                            : null,

                    order_created_at:
                        order
                            ? order.created_at
                            : null

                };

            }
        );


    return {

        total,

        average,

        distribution,

        reviews:
            formattedReviews

    };

}


module.exports = {
    getAdminReviews
};