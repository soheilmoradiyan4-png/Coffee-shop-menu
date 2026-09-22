const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api"
        : "/api";


// ========================================
// DOM Elements
// ========================================

const reviewsCount =
    document.getElementById("reviews-count");

const reviewsAverage =
    document.getElementById("reviews-average");

const reviewsTotal =
    document.getElementById("reviews-total");

const reviewMessage =
    document.getElementById("review-message");

const reviewsContainer =
    document.getElementById("reviews-container");

const refreshReviewsButton =
    document.getElementById("refresh-reviews");


// ========================================
// Initialize
// ========================================

initializeAdminReviews();


async function initializeAdminReviews() {

    if (!reviewsContainer) {

        console.error(
            "Reviews container not found."
        );

        return;
    }


    setupReviewEvents();

    await loadAdminReviews();

}


// ========================================
// Events
// ========================================

function setupReviewEvents() {

    if (refreshReviewsButton) {

        refreshReviewsButton.addEventListener(
            "click",
            loadAdminReviews
        );

    }

}


// ========================================
// Load Reviews
// ========================================

async function loadAdminReviews() {

    showReviewMessage(
        "Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª Ù†Ø¸Ø±Ø§Øª...",
        "loading"
    );


    try {

        const response =
            await fetch(
                REVIEW_API_URL,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    credentials: "include"
                }
            );


        const result =
            await response.json();


        if (response.status === 401) {

            window.location.href =
                "./admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù†Ø¸Ø±Ø§Øª."
            );

        }


        const data =
            result.data || {};


        renderReviewStats(data);

        renderReviewDistribution(
            data.distribution || {}
        );

        renderReviews(
            data.reviews || []
        );


        clearReviewMessage();

    } catch (error) {

        console.error(
            "Admin reviews error:",
            error
        );


        showReviewMessage(
            error.message ||
            "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù†Ø¸Ø±Ø§Øª.",
            "error"
        );

    }

}


// ========================================
// Render Statistics
// ========================================

function renderReviewStats(data) {

    const total =
        Number(
            data.total ??
            data.count ??
            0
        );


    const average =
        Number(
            data.average ??
            0
        );


    if (reviewsCount) {

        reviewsCount.textContent =
            `${toPersianNumber(total)} Ù†Ø¸Ø±`;

    }


    if (reviewsTotal) {

        reviewsTotal.textContent =
            toPersianNumber(total);

    }


    if (reviewsAverage) {

        reviewsAverage.textContent =
            average > 0
                ? average.toFixed(1)
                : "Û°";

    }

}


// ========================================
// Render Distribution
// ========================================

function renderReviewDistribution(
    distribution
) {

    for (
        let rating = 1;
        rating <= 5;
        rating++
    ) {

        const count =
            Number(
                distribution[rating] ??
                distribution[String(rating)] ??
                0
            );


        const countElement =
            document.getElementById(
                `review-count-${rating}`
            );


        const barElement =
            document.getElementById(
                `review-bar-${rating}`
            );


        if (countElement) {

            countElement.textContent =
                toPersianNumber(count);

        }


        if (barElement) {

            barElement.style.width =
                calculateDistributionWidth(
                    count,
                    distribution
                );

        }

    }

}


// ========================================
// Distribution Width
// ========================================

function calculateDistributionWidth(
    count,
    distribution
) {

    let total = 0;


    for (
        let rating = 1;
        rating <= 5;
        rating++
    ) {

        total += Number(
            distribution[rating] ??
            distribution[String(rating)] ??
            0
        );

    }


    if (!total || !count) {

        return "0%";

    }


    return `${Math.round(
        (count / total) * 100
    )}%`;

}


// ========================================
// Render Reviews
// ========================================

function renderReviews(
    reviews
) {

    if (!reviewsContainer) {
        return;
    }


    if (!Array.isArray(reviews) ||
        reviews.length === 0) {

        reviewsContainer.innerHTML = `

            <div class="reviews-empty">

                <div class="reviews-empty-icon">
                    â­
                </div>

                <h3>
                    Ù‡Ù†ÙˆØ² Ù†Ø¸Ø±ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª
                </h3>

                <p>
                    ÙˆÙ‚ØªÛŒ Ù…Ø´ØªØ±ÛŒØ§Ù† Ù†Ø¸Ø± Ø®ÙˆØ¯ Ø±Ø§ Ø«Ø¨Øª Ú©Ù†Ù†Ø¯ØŒ
                    Ø§ÛŒÙ†Ø¬Ø§ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
                </p>

            </div>

        `;

        return;

    }


    reviewsContainer.innerHTML =
        reviews
            .map(
                review =>
                    createReviewCard(review)
            )
            .join("");

}


// ========================================
// Review Card
// ========================================

function createReviewCard(
    review
) {

    const rating =
        Number(review.rating) || 0;


    const comment =
        review.comment
            ? escapeHtml(review.comment)
            : "Ø¨Ø¯ÙˆÙ† Ù…ØªÙ†";


    const trackingCode =
        escapeHtml(
            String(
                review.tracking_code ??
                review.trackingCode ??
                "-"
            )
        );


    const orderId =
        review.order_id ??
        review.orderId ??
        "-";


    const createdAt =
        formatReviewDate(
            review.created_at ??
            review.createdAt
        );


    const stars =
        renderStars(rating);


    return `

        <article class="review-admin-card">

            <div class="review-admin-card-header">

                <div class="review-admin-rating">

                    ${stars}

                    <span class="review-rating-number">
                        ${toPersianNumber(rating)}
                        Ø§Ø² Ûµ
                    </span>

                </div>


                <span class="review-admin-date">
                    ${createdAt}
                </span>

            </div>


            <div class="review-admin-card-body">

                <p class="review-admin-comment">
                    ${comment}
                </p>

            </div>


            <div class="review-admin-card-footer">

                <span>
                    ðŸ§¾ Ø³ÙØ§Ø±Ø´:
                    ${escapeHtml(String(orderId))}
                </span>


                <span>
                    ðŸ”Ž Ú©Ø¯ Ù¾ÛŒÚ¯ÛŒØ±ÛŒ:
                    <b dir="ltr">
                        ${trackingCode}
                    </b>
                </span>

            </div>

        </article>

    `;

}


// ========================================
// Render Stars
// ========================================

function renderStars(
    rating
) {

    let html = "";


    for (
        let star = 1;
        star <= 5;
        star++
    ) {

        html +=
            star <= rating
                ? `<span class="review-admin-star active">â˜…</span>`
                : `<span class="review-admin-star">â˜…</span>`;

    }


    return html;

}


// ========================================
// Date
// ========================================

function formatReviewDate(
    dateValue
) {

    if (!dateValue) {

        return "ØªØ§Ø±ÛŒØ® Ù†Ø§Ù…Ø´Ø®Øµ";

    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "ØªØ§Ø±ÛŒØ® Ù†Ø§Ù…Ø´Ø®Øµ";

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


// ========================================
// Persian Numbers
// ========================================

function toPersianNumber(
    value
) {

    return String(value)
        .replace(
            /\d/g,
            digit =>
                "Û°Û±Û²Û³Û´ÛµÛ¶Û·Û¸Û¹"[digit]
        );

}


// ========================================
// Escape HTML
// ========================================

function escapeHtml(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ========================================
// Messages
// ========================================

function showReviewMessage(
    message,
    type = "info"
) {

    if (!reviewMessage) {
        return;
    }


    reviewMessage.textContent =
        message;


    reviewMessage.className =
        `review-management-message ${type}`;

}


function clearReviewMessage() {

    if (!reviewMessage) {
        return;
    }


    reviewMessage.textContent = "";

    reviewMessage.className =
        "review-management-message";

}
