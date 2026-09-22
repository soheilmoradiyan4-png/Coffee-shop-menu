//const API_BASE_URL = "/api";
const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api"
        : "/api";
const STATUS_INFO = {

    new: {
        label: "سفارش جدید",
        className: "status-new",
        icon: "🟡"
    },

    preparing: {
        label: "در حال آماده‌سازی",
        className: "status-preparing",
        icon: "🟠"
    },

    ready: {
        label: "آماده تحویل",
        className: "status-ready",
        icon: "🟢"
    },

    done: {
        label: "تحویل‌شده",
        className: "status-done",
        icon: "✅"
    },

    cancelled: {
        label: "لغوشده",
        className: "status-cancelled",
        icon: "❌"
    }

};


const elements = {

    ordersContainer:
        document.getElementById("orders-container"),

    statusFilter:
        document.getElementById("status-filter"),

    refreshButton:
        document.getElementById("refresh-orders"),

    ordersCount:
        document.getElementById("orders-count"),

    message:
        document.getElementById("admin-message"),

    username:
        document.getElementById("admin-username"),

    logoutButton:
        document.getElementById("admin-logout")

};


document.addEventListener(
    "DOMContentLoaded",
    initializeAdmin
);


async function initializeAdmin() {

    const isAuthenticated =
        await checkAdminSession();

    if (!isAuthenticated) {
        return;
    }

    setupEvents();

    loadOrders();

}


/*
|--------------------------------------------------------------------------
| بررسی ورود مدیر
|--------------------------------------------------------------------------
*/

async function checkAdminSession() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/auth/me`,
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            window.location.href =
                "admin-login.html";

            return false;

        }


        const result =
            await response.json();


        if (
            result.success &&
            result.data &&
            result.data.username
        ) {

            elements.username.textContent =
                result.data.username;

        }


        return true;

    } catch (error) {

        console.error(
            "Admin session check error:",
            error
        );


        window.location.href =
            "admin-login.html";


        return false;

    }

}


/*
|--------------------------------------------------------------------------
| رویدادها
|--------------------------------------------------------------------------
*/

function setupEvents() {

    elements.statusFilter.addEventListener(
        "change",
        loadOrders
    );


    elements.refreshButton.addEventListener(
        "click",
        loadOrders
    );


    elements.ordersContainer.addEventListener(
        "change",
        handleStatusChange
    );


    elements.logoutButton.addEventListener(
        "click",
        handleLogout
    );

}


/*
|--------------------------------------------------------------------------
| خروج مدیر
|--------------------------------------------------------------------------
*/

async function handleLogout() {

    elements.logoutButton.disabled = true;

    elements.logoutButton.textContent =
        "در حال خروج...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "خطا در خروج از حساب."
            );

        }


        window.location.href =
            "admin-login.html";


    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );


        showMessage(
            error.message ||
            "خطا در خروج از حساب.",
            "error"
        );


        elements.logoutButton.disabled =
            false;

        elements.logoutButton.textContent =
            "🚪 خروج";

    }

}


/*
|--------------------------------------------------------------------------
| دریافت سفارش‌ها
|--------------------------------------------------------------------------
*/

async function loadOrders() {

    showMessage(
        "در حال دریافت سفارش‌ها...",
        "loading"
    );


    const status =
        elements.statusFilter.value;


    try {

        const url = status
            ? `${API_BASE_URL}/admin/orders?status=${encodeURIComponent(status)}`
            : `${API_BASE_URL}/admin/orders`;


        const response =
            await fetch(
                url,
                {
                    credentials: "include"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    "admin-login.html";

                return;

            }


            throw new Error(
                result.message ||
                "خطا در دریافت سفارش‌ها."
            );

        }


        renderOrders(
            result.data || []
        );


        showMessage(
            "سفارش‌ها با موفقیت دریافت شدند.",
            "success"
        );


    } catch (error) {

        console.error(
            "Load admin orders error:",
            error
        );


        elements.ordersContainer.innerHTML =
            "";


        updateOrdersCount(0);


        showMessage(
            error.message ||
            "خطا در دریافت سفارش‌ها.",
            "error"
        );

    }

}


/*
|--------------------------------------------------------------------------
| نمایش سفارش‌ها
|--------------------------------------------------------------------------
*/

function renderOrders(orders) {

    updateOrdersCount(
        orders.length
    );


    if (!orders.length) {

        elements.ordersContainer.innerHTML = `

            <div class="admin-empty">

                <div class="admin-empty-icon">
                    📭
                </div>

                <h2>
                    سفارشی پیدا نشد
                </h2>

                <p>
                    در این وضعیت سفارشی برای نمایش وجود ندارد.
                </p>

            </div>

        `;

        return;

    }


    elements.ordersContainer.innerHTML =
        orders
            .map(renderOrderCard)
            .join("");

}


/*
|--------------------------------------------------------------------------
| کارت سفارش
|--------------------------------------------------------------------------
*/

function renderOrderCard(order) {

    const status =
        getStatusInfo(order.status);


    const orderType =
        order.order_type === "dine_in"
            ? "سرو در کافه"
            : "بیرون‌بر";


    const tableInfo =
        order.order_type === "dine_in"
            ? `میز ${order.table_no}`
            : "—";


    const customerName =
        order.customer_name
            ? escapeHtml(order.customer_name)
            : "بدون نام";


    const note =
        order.note
            ? escapeHtml(order.note)
            : "بدون توضیحات";


    const items =
        Array.isArray(order.order_items)
            ? order.order_items
            : [];


    return `

        <article class="order-card">


            <div class="order-card-header">

                <div>

                    <h2>
                        سفارش #${order.id}
                    </h2>

                    <span class="order-tracking-code">

                        کد پیگیری:
                        ${escapeHtml(order.tracking_code)}

                    </span>

                </div>


                <span
                    class="tracking-status ${status.className}"
                >

                    ${status.icon}
                    ${status.label}

                </span>

            </div>


            <div class="order-info-grid">


                <div class="order-info-item">

                    <span>
                        نوع سفارش
                    </span>

                    <strong>
                        ${orderType}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span>
                        میز
                    </span>

                    <strong>
                        ${tableInfo}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span>
                        مشتری
                    </span>

                    <strong>
                        ${customerName}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span>
                        زمان ثبت
                    </span>

                    <strong>
                        ${formatDate(order.created_at)}
                    </strong>

                </div>


            </div>


            <div class="order-items">

                <h3>
                    اقلام سفارش
                </h3>


                ${items
                    .map(renderOrderItem)
                    .join("")}

            </div>


            <div class="order-note">

                <strong>
                    یادداشت مشتری:
                </strong>

                <span>
                    ${note}
                </span>

            </div>


            <div class="order-card-footer">


                <div class="order-total">

                    <span>
                        مبلغ کل
                    </span>

                    <strong>

                        ${formatPrice(order.total)}
                        تومان

                    </strong>

                </div>


                <div class="order-status-control">

                    <label>
                        تغییر وضعیت
                    </label>


                    <select
                        class="order-status-select"
                        data-order-id="${order.id}"
                        data-current-status="${order.status}"
                    >

                        ${renderStatusOptions(
                            order.status
                        )}

                    </select>

                </div>


            </div>


        </article>

    `;

}


/*
|--------------------------------------------------------------------------
| آیتم سفارش
|--------------------------------------------------------------------------
*/

function renderOrderItem(item) {

    return `

        <div class="order-item">


            <div class="order-item-name">

                <strong>
                    ${escapeHtml(item.product_name)}
                </strong>

                <span>
                    × ${item.quantity}
                </span>

            </div>


            <strong>

                ${formatPrice(item.subtotal)}
                تومان

            </strong>


        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| گزینه‌های وضعیت
|--------------------------------------------------------------------------
*/

function renderStatusOptions(currentStatus) {

    return Object.entries(STATUS_INFO)

        .map(([status, info]) => {

            const selected =
                status === currentStatus
                    ? "selected"
                    : "";


            return `

                <option
                    value="${status}"
                    ${selected}
                >

                    ${info.icon}
                    ${info.label}

                </option>

            `;

        })

        .join("");

}


/*
|--------------------------------------------------------------------------
| تغییر وضعیت سفارش
|--------------------------------------------------------------------------
*/

async function handleStatusChange(event) {

    const select =
        event.target.closest(
            ".order-status-select"
        );


    if (!select) {
        return;
    }


    const orderId =
        select.dataset.orderId;


    const oldStatus =
        select.dataset.currentStatus;


    const newStatus =
        select.value;


    if (newStatus === oldStatus) {
        return;
    }


    select.disabled = true;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/orders/${orderId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        status: newStatus
                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    "admin-login.html";

                return;

            }


            throw new Error(
                result.message ||
                "خطا در تغییر وضعیت سفارش."
            );

        }


        select.dataset.currentStatus =
            newStatus;


        showMessage(
            "وضعیت سفارش با موفقیت تغییر کرد.",
            "success"
        );


        await loadOrders();


    } catch (error) {

        console.error(
            "Update order status error:",
            error
        );


        select.value =
            oldStatus;


        showMessage(
            error.message ||
            "خطا در تغییر وضعیت سفارش.",
            "error"
        );


    } finally {

        select.disabled = false;

    }

}


/*
|--------------------------------------------------------------------------
| اطلاعات وضعیت
|--------------------------------------------------------------------------
*/

function getStatusInfo(status) {

    return STATUS_INFO[status] || {

        label: "نامشخص",

        className: "",

        icon: "❔"

    };

}


/*
|--------------------------------------------------------------------------
| تعداد سفارش‌ها
|--------------------------------------------------------------------------
*/

function updateOrdersCount(count) {

    elements.ordersCount.textContent =
        `${toPersianNumber(count)} سفارش`;

}


/*
|--------------------------------------------------------------------------
| پیام
|--------------------------------------------------------------------------
*/

function showMessage(message, type) {

    elements.message.textContent =
        message;


    elements.message.className =
        `admin-message ${type}`;

}


/*
|--------------------------------------------------------------------------
| فرمت قیمت
|--------------------------------------------------------------------------
*/

function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("fa-IR");

}


/*
|--------------------------------------------------------------------------
| فرمت تاریخ
|--------------------------------------------------------------------------
*/

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "fa-IR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


/*
|--------------------------------------------------------------------------
| اعداد فارسی
|--------------------------------------------------------------------------
*/

function toPersianNumber(number) {

    return Number(number)
        .toLocaleString("fa-IR");

}


/*
|--------------------------------------------------------------------------
| جلوگیری از HTML Injection
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
