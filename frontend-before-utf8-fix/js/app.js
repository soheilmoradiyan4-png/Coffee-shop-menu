let products = [];

let categories = [];

let selectedCategoryId = null;


// ==============================
// Review State
// ==============================

let currentTrackingCode = null;

let selectedReviewRating = 0;


// ==============================
// Review Elements
// ==============================

const reviewSection =
    document.getElementById(
        "review-section"
    );

const reviewForm =
    document.getElementById(
        "review-form"
    );

const reviewStars =
    document.getElementById(
        "review-stars"
    );

const reviewComment =
    document.getElementById(
        "review-comment"
    );

const reviewMessage =
    document.getElementById(
        "review-message"
    );

const reviewSubmit =
    document.getElementById(
        "review-submit"
    );

const reviewSubmitted =
    document.getElementById(
        "review-submitted"
    );

const reviewSubmittedStars =
    document.getElementById(
        "review-submitted-stars"
    );

const reviewSubmittedComment =
    document.getElementById(
        "review-submitted-comment"
    );


// ==============================
// Initialize App
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


async function initializeApp() {

    try {

        products =
            await fetchProducts();

        categories =
            await fetchCategories();


        renderCategories();

        renderProducts();


        setupCartEvents();

        setupCheckoutEvents();

        setupTrackingEvents();

        setupReviewEvents();


        renderCart();

        updateCartSummary();


        hideReviewSection();

    } catch (error) {

        console.error(error);

        showError();

    }

}


// ==============================
// Categories
// ==============================

function renderCategories() {

    const container =
        document.getElementById(
            "categories"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const allButton =
        document.createElement(
            "button"
        );


    allButton.className =
        "category-button active";


    allButton.textContent =
        "همه";


    allButton.addEventListener(
        "click",
        () => {

            selectedCategoryId =
                null;

            updateCategoryButtons();

            renderProducts();

        }
    );


    container.appendChild(
        allButton
    );


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-button";


            button.dataset.categoryId =
                category.id;


            button.textContent =
                category.name;


            button.addEventListener(
                "click",
                () => {

                    selectedCategoryId =
                        category.id;


                    updateCategoryButtons();

                    renderProducts();

                }
            );


            container.appendChild(
                button
            );

        }
    );

}


// ==============================
// Category Buttons
// ==============================

function updateCategoryButtons() {

    const buttons =
        document.querySelectorAll(
            ".category-button"
        );


    buttons.forEach(
        button => {

            const categoryId =
                button.dataset.categoryId;


            const isAll =
                selectedCategoryId === null &&
                !categoryId;


            const isSelected =
                categoryId &&
                Number(categoryId) ===
                    selectedCategoryId;


            button.classList.toggle(
                "active",
                isAll || isSelected
            );

        }
    );

}


// ==============================
// Products
// ==============================

function renderProducts() {

    const container =
        document.getElementById(
            "products"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const filteredProducts =
        selectedCategoryId === null
            ? products
            : products.filter(
                product =>
                    product.category_id ===
                    selectedCategoryId
            );


    filteredProducts.forEach(
        product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                product.name;


            const description =
                document.createElement(
                    "p"
                );


            description.className =
                "product-description";


            description.textContent =
                product.description || "";


            const price =
                document.createElement(
                    "div"
                );


            price.className =
                "product-price";


            price.textContent =
                `${formatPrice(
                    product.price
                )} تومان`;


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "add-to-cart";


            button.textContent =
                product.available
                    ? "افزودن به سبد"
                    : "ناموجود";


            button.disabled =
                !product.available;


            button.addEventListener(
                "click",
                () => {

                    addToCart(product);

                }
            );


            card.appendChild(
                title
            );

            card.appendChild(
                description
            );

            card.appendChild(
                price
            );

            card.appendChild(
                button
            );


            container.appendChild(
                card
            );

        }
    );

}


// ==============================
// Checkout
// ==============================

function handleCheckout() {

    if (cart.length === 0) {

        return;

    }


    const checkout =
        document.getElementById(
            "checkout"
        );


    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    checkoutTotal.textContent =
        `${formatPrice(
            getCartTotal()
        )} تومان`;


    checkout.hidden =
        false;


    checkout.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==============================
// Checkout Events
// ==============================

function setupCheckoutEvents() {

    const checkoutForm =
        document.getElementById(
            "checkout-form"
        );


    const closeButton =
        document.getElementById(
            "close-checkout"
        );


    const orderTypeInputs =
        document.querySelectorAll(
            'input[name="orderType"]'
        );


    if (!checkoutForm) {

        return;

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "checkout"
                ).hidden = true;

            }
        );

    }


    orderTypeInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                updateOrderTypeFields
            );

        }
    );


    checkoutForm.addEventListener(
        "submit",
        handleOrderSubmit
    );


    updateOrderTypeFields();

}


// ==============================
// Order Type
// ==============================

function updateOrderTypeFields() {

    const selected =
        document.querySelector(
            'input[name="orderType"]:checked'
        );


    const tableField =
        document.getElementById(
            "table-field"
        );


    const tableInput =
        document.getElementById(
            "table-no"
        );


    if (
        !tableField ||
        !tableInput
    ) {

        return;

    }


    if (
        selected &&
        selected.value === "dine_in"
    ) {

        tableField.hidden =
            false;

        tableInput.required =
            true;

    } else {

        tableField.hidden =
            true;

        tableInput.required =
            false;

        tableInput.value =
            "";

    }

}


// ==============================
// Submit Order
// ==============================

async function handleOrderSubmit(event) {

    event.preventDefault();


    if (cart.length === 0) {

        return;

    }


    const form =
        event.target;


    const submitButton =
        document.getElementById(
            "submit-order"
        );


    const message =
        document.getElementById(
            "checkout-message"
        );


    const formData =
        new FormData(form);


    const orderType =
        formData.get(
            "orderType"
        );


    const tableNo =
        formData.get(
            "tableNo"
        );


    const customerName =
        formData.get(
            "customerName"
        );


    const note =
        formData.get(
            "note"
        );


    const items =
        cart.map(
            item => ({

                productId:
                    item.id,

                quantity:
                    item.quantity

            })
        );


    const orderData = {

        orderType,

        tableNo:
            tableNo
                ? Number(tableNo)
                : null,

        customerName,

        note,

        items

    };


    submitButton.disabled =
        true;


    submitButton.textContent =
        "در حال ثبت سفارش...";


    message.textContent =
        "";


    message.classList.remove(
        "success",
        "error"
    );


    try {

        const result =
            await createOrder(
                orderData
            );


        console.log(
            "Order created:",
            result
        );


        localStorage.removeItem(
            CART_STORAGE_KEY
        );


        cart = [];


        renderCart();

        updateCartSummary();


        form.reset();

        updateOrderTypeFields();


        message.textContent =
            `سفارش شما با موفقیت ثبت شد. کد پیگیری: ${result.data.trackingCode}`;


        message.classList.add(
            "success"
        );


    } catch (error) {

        console.error(
            "Submit order error:",
            error
        );


        message.textContent =
            error.message ||
            "خطا در ثبت سفارش.";


        message.classList.add(
            "error"
        );


    } finally {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "ثبت سفارش";

    }

}


// ==============================
// Tracking Events
// ==============================

function setupTrackingEvents() {

    const trackingForm =
        document.getElementById(
            "tracking-form"
        );


    if (!trackingForm) {

        return;

    }


    trackingForm.addEventListener(
        "submit",
        handleTrackingSubmit
    );

}


// ==============================
// Submit Tracking
// ==============================

async function handleTrackingSubmit(event) {

    event.preventDefault();


    const form =
        event.target;


    const input =
        document.getElementById(
            "tracking-code"
        );


    const submitButton =
        document.getElementById(
            "tracking-submit"
        );


    const message =
        document.getElementById(
            "tracking-message"
        );


    const resultContainer =
        document.getElementById(
            "tracking-result"
        );


    const trackingCode =
        input.value.trim();


    if (
        !/^\d{6}$/.test(
            trackingCode
        )
    ) {

        message.textContent =
            "کد پیگیری باید ۶ رقم باشد.";

        message.className =
            "tracking-message error";

        resultContainer.hidden =
            true;

        hideReviewSection();

        return;

    }


    submitButton.disabled =
        true;


    submitButton.textContent =
        "در حال دریافت...";


    message.textContent =
        "";

    message.className =
        "tracking-message";


    resultContainer.hidden =
        true;


    hideReviewSection();


    currentTrackingCode =
        trackingCode;


    try {

        const order =
            await fetchOrderByTrackingCode(
                trackingCode
            );


        renderTrackingResult(
            order
        );


        message.textContent =
            "سفارش پیدا شد.";

        message.className =
            "tracking-message success";


    } catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        currentTrackingCode =
            null;


        message.textContent =
            error.message ||
            "خطا در دریافت سفارش.";


        message.className =
            "tracking-message error";

    } finally {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "پیگیری سفارش";

    }

}


// ==============================
// Render Tracking Result
// ==============================

function renderTrackingResult(order) {

    const container =
        document.getElementById(
            "tracking-result"
        );


    if (!container) {

        return;

    }


    currentTrackingCode =
        order.tracking_code;


    const statusInfo =
        getOrderStatusInfo(
            order.status
        );


    const itemsHtml =
        order.order_items
            .map(
                item => `

                    <div class="tracking-item">

                        <div class="tracking-item-info">

                            <strong>
                                ${escapeHtml(
                                    item.product_name
                                )}
                            </strong>

                            <span>
                                ${formatPrice(
                                    item.unit_price
                                )} تومان ×
                                ${item.quantity}
                            </span>

                        </div>

                        <strong>
                            ${formatPrice(
                                item.subtotal
                            )} تومان
                        </strong>

                    </div>

                `
            )
            .join("");


    container.innerHTML = `

        <div class="tracking-card">

            <div class="tracking-card-header">

                <div>

                    <span>
                        کد پیگیری
                    </span>

                    <strong>
                        ${escapeHtml(
                            order.tracking_code
                        )}
                    </strong>

                </div>

                <div
                    class="tracking-status ${statusInfo.className}"
                >
                    ${statusInfo.icon}
                    ${statusInfo.label}
                </div>

            </div>


            <div class="tracking-order-info">

                <div>

                    <span>
                        نوع سفارش
                    </span>

                    <strong>

                        ${
                            order.order_type ===
                            "dine_in"

                                ? "داخل کافه"

                                : "بیرون‌بر"

                        }

                    </strong>

                </div>


                ${
                    order.order_type ===
                    "dine_in"

                        ? `

                            <div>

                                <span>
                                    شماره میز
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        order.table_no
                                    )}
                                </strong>

                            </div>

                        `

                        : ""
                }

            </div>


            <div class="tracking-items">

                <h3>
                    محصولات سفارش
                </h3>

                ${itemsHtml}

            </div>


            <div class="tracking-total">

                <span>
                    مبلغ کل
                </span>

                <strong>
                    ${formatPrice(
                        order.total
                    )} تومان
                </strong>

            </div>

        </div>

    `;


    container.hidden =
        false;


    container.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    loadReviewForOrder(
        currentTrackingCode,
        order.status
    );

}


// ==============================
// Order Status
// ==============================

function getOrderStatusInfo(status) {

    const statuses = {

        new: {

            label:
                "سفارش جدید",

            icon:
                "🟡",

            className:
                "status-new"

        },


        preparing: {

            label:
                "در حال آماده‌سازی",

            icon:
                "🟠",

            className:
                "status-preparing"

        },


        ready: {

            label:
                "آماده تحویل",

            icon:
                "🟢",

            className:
                "status-ready"

        },


        done: {

            label:
                "تحویل‌شده",

            icon:
                "✅",

            className:
                "status-done"

        },


        cancelled: {

            label:
                "لغوشده",

            icon:
                "❌",

            className:
                "status-cancelled"

        }

    };


    return (
        statuses[status] ||

        {

            label:
                "وضعیت نامشخص",

            icon:
                "❔",

            className:
                "status-unknown"

        }
    );

}


// ==============================
// Review Events
// ==============================

function setupReviewEvents() {

    if (
        !reviewForm ||
        !reviewStars
    ) {

        return;

    }


    reviewStars.addEventListener(
        "click",
        handleReviewStarClick
    );


    reviewForm.addEventListener(
        "submit",
        handleReviewSubmit
    );

}


// ==============================
// Review Star Click
// ==============================

function handleReviewStarClick(event) {

    const star =
        event.target.closest(
            ".review-star"
        );


    if (!star) {

        return;

    }


    const rating =
        Number(
            star.dataset.rating
        );


    if (
        !Number.isInteger(
            rating
        ) ||
        rating < 1 ||
        rating > 5
    ) {

        return;

    }


    selectedReviewRating =
        rating;


    updateReviewStars();


    clearReviewMessage();

}


// ==============================
// Update Review Stars
// ==============================

function updateReviewStars() {

    if (!reviewStars) {

        return;

    }


    const stars =
        reviewStars.querySelectorAll(
            ".review-star"
        );


    stars.forEach(
        star => {

            const rating =
                Number(
                    star.dataset.rating
                );


            star.classList.toggle(
                "active",
                rating <=
                    selectedReviewRating
            );

        }
    );

}


// ==============================
// Load Review
// ==============================

async function loadReviewForOrder(
    trackingCode,
    orderStatus
) {

    hideReviewSection();


    if (
        orderStatus !== "done"
    ) {

        return;

    }


    if (!trackingCode) {

        return;

    }


    try {

        const result =
            await fetchReviewByTrackingCode(
                trackingCode
            );


        currentTrackingCode =
            trackingCode;


        if (
            result.reviewed
        ) {

            renderSubmittedReview(
                result.review
            );

            return;

        }


        showReviewForm();


    } catch (error) {

        console.error(
            "loadReviewForOrder:",
            error
        );


        hideReviewSection();

    }

}


// ==============================
// Show Review Form
// ==============================

function showReviewForm() {

    if (!reviewSection) {

        return;

    }


    reviewSection.hidden =
        false;


    reviewForm.hidden =
        false;


    reviewSubmitted.hidden =
        true;


    selectedReviewRating =
        0;


    updateReviewStars();


    reviewComment.value =
        "";


    clearReviewMessage();

}


// ==============================
// Hide Review
// ==============================

function hideReviewSection() {

    if (!reviewSection) {

        return;

    }


    reviewSection.hidden =
        true;


    if (reviewForm) {

        reviewForm.hidden =
            false;

    }


    if (reviewSubmitted) {

        reviewSubmitted.hidden =
            true;

    }


    selectedReviewRating =
        0;


    updateReviewStars();

}


// ==============================
// Submit Review
// ==============================

async function handleReviewSubmit(
    event
) {

    event.preventDefault();


    if (
        !currentTrackingCode
    ) {

        showReviewMessage(
            "کد پیگیری سفارش پیدا نشد.",
            "error"
        );

        return;

    }


    if (
        selectedReviewRating < 1 ||
        selectedReviewRating > 5
    ) {

        showReviewMessage(
            "لطفاً امتیاز خود را انتخاب کنید.",
            "error"
        );

        return;

    }


    const comment =
        reviewComment.value.trim();


    setReviewLoading(
        true
    );


    try {

        const result =
            await createReview(
                currentTrackingCode,
                {

                    rating:
                        selectedReviewRating,

                    comment

                }
            );


        showReviewMessage(
            "نظر شما با موفقیت ثبت شد.",
            "success"
        );


        renderSubmittedReview(
            result.review
        );


    } catch (error) {

        console.error(
            "handleReviewSubmit:",
            error
        );


        showReviewMessage(
            error.message ||
            "ثبت نظر انجام نشد.",
            "error"
        );

    } finally {

        setReviewLoading(
            false
        );

    }

}


// ==============================
// Render Submitted Review
// ==============================

function renderSubmittedReview(
    review
) {

    if (
        !reviewSection ||
        !reviewSubmitted
    ) {

        return;

    }


    reviewSection.hidden =
        false;


    reviewForm.hidden =
        true;


    reviewSubmitted.hidden =
        false;


    const rating =
        Number(
            review.rating
        );


    reviewSubmittedStars.textContent =
        "★".repeat(
            rating
        ) +

        "☆".repeat(
            5 - rating
        );


    if (
        review.comment
    ) {

        reviewSubmittedComment.textContent =
            `«${review.comment}»`;

        reviewSubmittedComment.hidden =
            false;

    } else {

        reviewSubmittedComment.textContent =
            "";

        reviewSubmittedComment.hidden =
            true;

    }

}


// ==============================
// Review Message
// ==============================

function showReviewMessage(
    message,
    type
) {

    if (!reviewMessage) {

        return;

    }


    reviewMessage.textContent =
        message;


    reviewMessage.className =
        `review-message ${type}`;

}


function clearReviewMessage() {

    if (!reviewMessage) {

        return;

    }


    reviewMessage.textContent =
        "";


    reviewMessage.className =
        "review-message";

}


// ==============================
// Review Loading
// ==============================

function setReviewLoading(
    loading
) {

    if (
        reviewSubmit
    ) {

        reviewSubmit.disabled =
            loading;


        reviewSubmit.textContent =
            loading

                ? "در حال ثبت..."

                : "ثبت نظر";

    }


    if (!reviewStars) {

        return;

    }


    reviewStars
        .querySelectorAll(
            ".review-star"
        )
        .forEach(
            star => {

                star.disabled =
                    loading;

            }
        );

}


// ==============================
// Format Price
// ==============================

function formatPrice(price) {

    return new Intl.NumberFormat(
        "fa-IR"
    ).format(price);

}


// ==============================
// Escape HTML
// ==============================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==============================
// Error
// ==============================

function showError() {

    const container =
        document.getElementById(
            "products"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <p>
            دریافت اطلاعات منو با خطا مواجه شد.
        </p>

    `;

}