const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api"
        : "/api";

const STATUS_INFO = {

    new: {
        label: "Ø³ÙØ§Ø±Ø´ Ø¬Ø¯ÛŒØ¯",
        className: "status-new",
        icon: "ðŸŸ¡"
    },

    preparing: {
        label: "Ø¯Ø± Ø­Ø§Ù„ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ",
        className: "status-preparing",
        icon: "ðŸŸ "
    },

    ready: {
        label: "Ø¢Ù…Ø§Ø¯Ù‡ ØªØ­ÙˆÛŒÙ„",
        className: "status-ready",
        icon: "ðŸŸ¢"
    },

    done: {
        label: "ØªØ­ÙˆÛŒÙ„â€ŒØ´Ø¯Ù‡",
        className: "status-done",
        icon: "âœ…"
    },

    cancelled: {
        label: "Ù„ØºÙˆØ´Ø¯Ù‡",
        className: "status-cancelled",
        icon: "âŒ"
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
| Ø¨Ø±Ø±Ø³ÛŒ ÙˆØ±ÙˆØ¯ Ù…Ø¯ÛŒØ±
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
                "/admin-login.html";

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
            "/admin-login.html";


        return false;

    }

}


/*
|--------------------------------------------------------------------------
| Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§
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
| Ø®Ø±ÙˆØ¬ Ù…Ø¯ÛŒØ±
|--------------------------------------------------------------------------
*/

async function handleLogout() {

    elements.logoutButton.disabled = true;

    elements.logoutButton.textContent =
        "Ø¯Ø± Ø­Ø§Ù„ Ø®Ø±ÙˆØ¬...";


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
                "Ø®Ø·Ø§ Ø¯Ø± Ø®Ø±ÙˆØ¬ Ø§Ø² Ø­Ø³Ø§Ø¨."
            );

        }


        window.location.href =
            "/admin-login.html";


    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );


        showMessage(
            error.message ||
            "Ø®Ø·Ø§ Ø¯Ø± Ø®Ø±ÙˆØ¬ Ø§Ø² Ø­Ø³Ø§Ø¨.",
            "error"
        );


        elements.logoutButton.disabled =
            false;

        elements.logoutButton.textContent =
            "ðŸšª Ø®Ø±ÙˆØ¬";

    }

}


/*
|--------------------------------------------------------------------------
| Ø¯Ø±ÛŒØ§ÙØª Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§
|--------------------------------------------------------------------------
*/

async function loadOrders() {

    showMessage(
        "Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§...",
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
                    "/admin-login.html";

                return;

            }


            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§."
            );

        }


        renderOrders(
            result.data || []
        );


        showMessage(
            "Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¯Ø±ÛŒØ§ÙØª Ø´Ø¯Ù†Ø¯.",
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
            "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§.",
            "error"
        );

    }

}


/*
|--------------------------------------------------------------------------
| Ù†Ù…Ø§ÛŒØ´ Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§
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
                    ðŸ“­
                </div>

                <h2>
                    Ø³ÙØ§Ø±Ø´ÛŒ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯
                </h2>

                <p>
                    Ø¯Ø± Ø§ÛŒÙ† ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´ÛŒ Ø¨Ø±Ø§ÛŒ Ù†Ù…Ø§ÛŒØ´ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
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
| Ú©Ø§Ø±Øª Ø³ÙØ§Ø±Ø´
|--------------------------------------------------------------------------
*/

function renderOrderCard(order) {

    const status =
        getStatusInfo(order.status);


    const orderType =
        order.order_type === "dine_in"
            ? "Ø³Ø±Ùˆ Ø¯Ø± Ú©Ø§ÙÙ‡"
            : "Ø¨ÛŒØ±ÙˆÙ†â€ŒØ¨Ø±";


    const tableInfo =
        order.order_type === "dine_in"
            ? `Ù…ÛŒØ² ${order.table_no}`
            : "â€”";


    const customerName =
        order.customer_name
            ? escapeHtml(order.customer_name)
            : "Ø¨Ø¯ÙˆÙ† Ù†Ø§Ù…";


    const note =
        order.note
            ? escapeHtml(order.note)
            : "Ø¨Ø¯ÙˆÙ† ØªÙˆØ¶ÛŒØ­Ø§Øª";


    const items =
        Array.isArray(order.order_items)
            ? order.order_items
            : [];


    return `

        <article class="order-card">


            <div class="order-card-header">

                <div>

                    <h2>
                        Ø³ÙØ§Ø±Ø´ #${order.id}
                    </h2>

                    <span class="order-tracking-code">

                        Ú©Ø¯ Ù¾ÛŒÚ¯ÛŒØ±ÛŒ:
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
                        Ù†ÙˆØ¹ Ø³ÙØ§Ø±Ø´
                    </span>

                    <strong>
                        ${orderType}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span>
                        Ù…ÛŒØ²
                    </span>

                    <strong>
                        ${tableInfo}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span>
                        Ù…Ø´ØªØ±ÛŒ
                    </span>

                    <strong>
                        ${customerName}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span>
                        Ø²Ù…Ø§Ù† Ø«Ø¨Øª
                    </span>

                    <strong>
                        ${formatDate(order.created_at)}
                    </strong>

                </div>


            </div>


            <div class="order-items">

                <h3>
                    Ø§Ù‚Ù„Ø§Ù… Ø³ÙØ§Ø±Ø´
                </h3>


                ${items
                    .map(renderOrderItem)
                    .join("")}

            </div>


            <div class="order-note">

                <strong>
                    ÛŒØ§Ø¯Ø¯Ø§Ø´Øª Ù…Ø´ØªØ±ÛŒ:
                </strong>

                <span>
                    ${note}
                </span>

            </div>


            <div class="order-card-footer">


                <div class="order-total">

                    <span>
                        Ù…Ø¨Ù„Øº Ú©Ù„
                    </span>

                    <strong>

                        ${formatPrice(order.total)}
                        ØªÙˆÙ…Ø§Ù†

                    </strong>

                </div>


                <div class="order-status-control">

                    <label>
                        ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª
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
| Ø¢ÛŒØªÙ… Ø³ÙØ§Ø±Ø´
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
                    Ã— ${item.quantity}
                </span>

            </div>


            <strong>

                ${formatPrice(item.subtotal)}
                ØªÙˆÙ…Ø§Ù†

            </strong>


        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Ú¯Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ÛŒ ÙˆØ¶Ø¹ÛŒØª
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
| ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´
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
                    "/admin-login.html";

                return;

            }


            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´."
            );

        }


        select.dataset.currentStatus =
            newStatus;


        showMessage(
            "ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª ØªØºÛŒÛŒØ± Ú©Ø±Ø¯.",
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
            "Ø®Ø·Ø§ Ø¯Ø± ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´.",
            "error"
        );


    } finally {

        select.disabled = false;

    }

}


/*
|--------------------------------------------------------------------------
| Ø§Ø·Ù„Ø§Ø¹Ø§Øª ÙˆØ¶Ø¹ÛŒØª
|--------------------------------------------------------------------------
*/

function getStatusInfo(status) {

    return STATUS_INFO[status] || {

        label: "Ù†Ø§Ù…Ø´Ø®Øµ",

        className: "",

        icon: "â”"

    };

}


/*
|--------------------------------------------------------------------------
| ØªØ¹Ø¯Ø§Ø¯ Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§
|--------------------------------------------------------------------------
*/

function updateOrdersCount(count) {

    elements.ordersCount.textContent =
        `${toPersianNumber(count)} Ø³ÙØ§Ø±Ø´`;

}


/*
|--------------------------------------------------------------------------
| Ù¾ÛŒØ§Ù…
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
| ÙØ±Ù…Øª Ù‚ÛŒÙ…Øª
|--------------------------------------------------------------------------
*/

function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("fa-IR");

}


/*
|--------------------------------------------------------------------------
| ÙØ±Ù…Øª ØªØ§Ø±ÛŒØ®
|--------------------------------------------------------------------------
*/

function formatDate(dateString) {

    if (!dateString) {
        return "â€”";
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
| Ø§Ø¹Ø¯Ø§Ø¯ ÙØ§Ø±Ø³ÛŒ
|--------------------------------------------------------------------------
*/

function toPersianNumber(number) {

    return Number(number)
        .toLocaleString("fa-IR");

}


/*
|--------------------------------------------------------------------------
| Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² HTML Injection
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
