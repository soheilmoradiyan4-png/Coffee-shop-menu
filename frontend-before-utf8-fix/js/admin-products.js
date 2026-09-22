const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api"
        : "/api";

const productForm =
    document.getElementById("product-form");

const productIdInput =
    document.getElementById("product-id");

const productNameInput =
    document.getElementById("product-name");

const productCategoryInput =
    document.getElementById("product-category");

const productPriceInput =
    document.getElementById("product-price");

const productDescriptionInput =
    document.getElementById("product-description");

const productSortOrderInput =
    document.getElementById("product-sort-order");

const productAvailableInput =
    document.getElementById("product-available");

const productSubmitButton =
    document.getElementById("product-submit");

const productCancelButton =
    document.getElementById("product-cancel");

const productFormTitle =
    document.getElementById("product-form-title");

const productMessage =
    document.getElementById("product-message");

const productsContainer =
    document.getElementById("products-container");

const productsCount =
    document.getElementById("products-count");


let products = [];
let categories = [];

let editingProductId = null;


/* =========================================
   Initialize
========================================= */


async function initializeProducts() {

    if (!productForm) {
        console.error(
            "Product form not found."
        );

        return;
    }

    setupProductEvents();

    await loadProductCategories();

    await loadProducts();
}


/* =========================================
   Events
========================================= */

function setupProductEvents() {

    productForm.addEventListener(
        "submit",
        handleProductSubmit
    );


    productCancelButton.addEventListener(
        "click",
        resetProductForm
    );


    productsContainer.addEventListener(
        "click",
        handleProductAction
    );
}


/* =========================================
   Load Categories
========================================= */

async function loadProductCategories() {

    try {

        console.log(
            "Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§ÛŒ Ù…Ø­ØµÙˆÙ„Ø§Øª..."
        );

        const response = await fetch(
            PRODUCT_CATEGORY_API_URL,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        console.log(
            "Category response:",
            response.status
        );


        if (response.status === 401) {

            window.location.href =
                "/admin-login.html";

            return;
        }


        const result =
            await response.json();


        console.log(
            "Category data:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§."
            );
        }


        categories =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderCategoryOptions();


    } catch (error) {

        console.error(
            "loadProductCategories:",
            error
        );


        showProductMessage(
            error.message ||
            "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§.",
            "error"
        );
    }
}


/* =========================================
   Category Options
========================================= */

function renderCategoryOptions() {

    productCategoryInput.innerHTML = `
        <option value="">
            Ø§Ù†ØªØ®Ø§Ø¨ Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ
        </option>
    `;


    if (!categories.length) {

        console.warn(
            "Ù‡ÛŒÚ† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒØ§ÛŒ Ø¯Ø±ÛŒØ§ÙØª Ù†Ø´Ø¯."
        );

        return;
    }


    categories.forEach(category => {

        const option =
            document.createElement("option");


        option.value =
            String(category.id);


        option.textContent =
            category.name;


        productCategoryInput.appendChild(
            option
        );
    });


    console.log(
        "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§ÛŒ ÙØ±Ù…:",
        categories
    );
}

/* =========================================
   Load Products
========================================= */

async function loadProducts() {

    productsContainer.innerHTML = `
        <div class="products-loading">
            Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª Ù…Ø­ØµÙˆÙ„Ø§Øª...
        </div>
    `;


    try {

        console.log(
            "Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª Ù…Ø­ØµÙˆÙ„Ø§Øª..."
        );


        const response = await fetch(
            PRODUCT_API_URL,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        console.log(
            "Product response:",
            response.status
        );


        if (response.status === 401) {

            window.location.href =
                "/admin-login.html";

            return;
        }


        const result =
            await response.json();


        console.log(
            "Product data:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù…Ø­ØµÙˆÙ„Ø§Øª."
            );
        }


        products =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderProducts();


    } catch (error) {

        console.error(
            "loadProducts:",
            error
        );


        productsContainer.innerHTML = `
            <div class="products-error">
                ${escapeHtml(
                    error.message ||
                    "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù…Ø­ØµÙˆÙ„Ø§Øª."
                )}
            </div>
        `;
    }
}

/* =========================================
   Render Products
========================================= */

function renderProducts() {

    productsCount.textContent =
        `${toPersianNumber(products.length)} Ù…Ø­ØµÙˆÙ„`;


    if (!products.length) {

        productsContainer.innerHTML = `
            <div class="products-empty">
                Ù‡Ù†ÙˆØ² Ù…Ø­ØµÙˆÙ„ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
            </div>
        `;

        return;
    }


    productsContainer.innerHTML =
        products
            .map(renderProductCard)
            .join("");
}


/* =========================================
   Product Card
========================================= */

function renderProductCard(product) {

    const categoryName =
        product.category?.name ||
        "Ø¨Ø¯ÙˆÙ† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ";


    const availabilityClass =
        product.available
            ? "available"
            : "unavailable";


    const availabilityText =
        product.available
            ? "Ù…ÙˆØ¬ÙˆØ¯"
            : "Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯";


    const toggleText =
        product.available
            ? "ØºÛŒØ±ÙØ¹Ø§Ù„ Ú©Ø±Ø¯Ù†"
            : "ÙØ¹Ø§Ù„ Ú©Ø±Ø¯Ù†";


    const description =
        product.description
            ? escapeHtml(product.description)
            : "Ø¨Ø¯ÙˆÙ† ØªÙˆØ¶ÛŒØ­Ø§Øª";


    return `
        <article
            class="product-admin-card"
            data-product-id="${product.id}"
        >

            <div class="product-card-main">

                <div class="product-card-title-row">

                    <h4>
                        ${escapeHtml(product.name)}
                    </h4>

                    <span
                        class="product-availability ${availabilityClass}"
                    >
                        ${availabilityText}
                    </span>

                </div>


                <div class="product-card-category">

                    ${escapeHtml(categoryName)}

                </div>


                <p class="product-card-description">

                    ${description}

                </p>


                <div class="product-card-meta">

                    <span>
                        ðŸ’°
                        ${formatPrice(product.price)}
                        ØªÙˆÙ…Ø§Ù†
                    </span>

                    <span>
                        ØªØ±ØªÛŒØ¨:
                        ${toPersianNumber(
                            product.sort_order
                        )}
                    </span>

                </div>

            </div>


            <div class="product-card-actions">

                <button
                    type="button"
                    class="product-action-button edit"
                    data-action="edit"
                    data-id="${product.id}"
                >
                    âœï¸ ÙˆÛŒØ±Ø§ÛŒØ´
                </button>


                <button
                    type="button"
                    class="product-action-button toggle"
                    data-action="toggle"
                    data-id="${product.id}"
                >
                    ${toggleText}
                </button>


                <button
                    type="button"
                    class="product-action-button delete"
                    data-action="delete"
                    data-id="${product.id}"
                >
                    ðŸ—‘ï¸ Ø­Ø°Ù
                </button>

            </div>

        </article>
    `;
}


/* =========================================
   Product Actions
========================================= */

async function handleProductAction(event) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.action;

    const productId =
        Number(button.dataset.id);


    if (!productId) {
        return;
    }


    if (action === "edit") {

        editProduct(productId);

        return;
    }


    if (action === "toggle") {

        await toggleProduct(productId);

        return;
    }


    if (action === "delete") {

        await deleteProduct(productId);

        return;
    }
}


/* =========================================
   Edit Product
========================================= */

function editProduct(productId) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                productId
        );


    if (!product) {
        return;
    }


    editingProductId =
        productId;


    productIdInput.value =
        product.id;

    productNameInput.value =
        product.name || "";

    productCategoryInput.value =
        product.category_id ?? "";

    productPriceInput.value =
        product.price ?? "";

    productDescriptionInput.value =
        product.description || "";

    productSortOrderInput.value =
        product.sort_order ?? 0;

    productAvailableInput.checked =
        Boolean(product.available);


    productFormTitle.textContent =
        "ÙˆÛŒØ±Ø§ÛŒØ´ Ù…Ø­ØµÙˆÙ„";


    productSubmitButton.textContent =
        "Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª";


    productCancelButton.hidden =
        false;


    clearProductMessage();


    productForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================
   Add / Update Product
========================================= */

async function handleProductSubmit(event) {

    event.preventDefault();


    const name =
        productNameInput.value.trim();

    const categoryId =
        productCategoryInput.value;

    const price =
        Number(productPriceInput.value);

    const description =
        productDescriptionInput.value.trim();

    const sortOrder =
        Number(productSortOrderInput.value);

    const available =
        productAvailableInput.checked;


    if (!name) {

        showProductMessage(
            "Ù†Ø§Ù… Ù…Ø­ØµÙˆÙ„ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.",
            "error"
        );

        return;
    }


    if (!categoryId) {

        showProductMessage(
            "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ù…Ø­ØµÙˆÙ„ Ø±Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ú©Ù†ÛŒØ¯.",
            "error"
        );

        return;
    }


    if (
        !Number.isInteger(price) ||
        price < 0
    ) {

        showProductMessage(
            "Ù‚ÛŒÙ…Øª Ù…Ø­ØµÙˆÙ„ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.",
            "error"
        );

        return;
    }


    if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
    ) {

        showProductMessage(
            "ØªØ±ØªÛŒØ¨ Ù†Ù…Ø§ÛŒØ´ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.",
            "error"
        );

        return;
    }


    const productData = {

        name,

        description,

        price,

        category_id:
            Number(categoryId),

        sort_order:
            sortOrder,

        available
    };


    setProductFormLoading(true);


    try {

        const isEditing =
            Boolean(editingProductId);


        const url =
            isEditing
                ? `${PRODUCT_API_URL}/${editingProductId}`
                : PRODUCT_API_URL;


        const method =
            isEditing
                ? "PATCH"
                : "POST";


        const response =
            await fetch(
                url,
                {
                    method,

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );


        if (response.status === 401) {

            window.location.href =
                "/admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø¹Ù…Ù„ÛŒØ§Øª Ù…Ø­ØµÙˆÙ„ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯."
            );
        }


        showProductMessage(
            result.message ||
            (
                isEditing
                    ? "Ù…Ø­ØµÙˆÙ„ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª ÙˆÛŒØ±Ø§ÛŒØ´ Ø´Ø¯."
                    : "Ù…Ø­ØµÙˆÙ„ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯."
            ),
            "success"
        );


        resetProductForm();


        await loadProducts();

    } catch (error) {

        console.error(
            "handleProductSubmit:",
            error
        );


        showProductMessage(
            error.message ||
            "Ø®Ø·Ø§ Ø¯Ø± Ø°Ø®ÛŒØ±Ù‡ Ù…Ø­ØµÙˆÙ„.",
            "error"
        );

    } finally {

        setProductFormLoading(false);
    }
}


/* =========================================
   Toggle Availability
========================================= */

async function toggleProduct(productId) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                productId
        );


    if (!product) {
        return;
    }


    try {

        const response =
            await fetch(
                `${PRODUCT_API_URL}/${productId}`,
                {
                    method: "PATCH",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name:
                            product.name,

                        description:
                            product.description || "",

                        price:
                            product.price,

                        category_id:
                            product.category_id,

                        sort_order:
                            product.sort_order,

                        available:
                            !product.available

                    })
                }
            );


        if (response.status === 401) {

            window.location.href =
                "/admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ù…Ø­ØµÙˆÙ„ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯."
            );
        }


        await loadProducts();

    } catch (error) {

        console.error(
            "toggleProduct:",
            error
        );


        showProductMessage(
            error.message ||
            "Ø®Ø·Ø§ Ø¯Ø± ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ù…Ø­ØµÙˆÙ„.",
            "error"
        );
    }
}


/* =========================================
   Delete Product
========================================= */

async function deleteProduct(productId) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                productId
        );


    if (!product) {
        return;
    }


    const confirmed =
        window.confirm(
            `Ø¢ÛŒØ§ Ø§Ø² Ø­Ø°Ù Â«${product.name}Â» Ù…Ø·Ù…Ø¦Ù† Ù‡Ø³ØªÛŒØ¯ØŸ`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${PRODUCT_API_URL}/${productId}`,
                {
                    method: "DELETE",

                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "/admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø­Ø°Ù Ù…Ø­ØµÙˆÙ„ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯."
            );
        }


        if (
            editingProductId ===
            productId
        ) {

            resetProductForm();
        }


        await loadProducts();


        showProductMessage(
            result.message ||
            "Ù…Ø­ØµÙˆÙ„ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø­Ø°Ù Ø´Ø¯.",
            "success"
        );

    } catch (error) {

        console.error(
            "deleteProduct:",
            error
        );


        showProductMessage(
            error.message ||
            "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ù…Ø­ØµÙˆÙ„.",
            "error"
        );
    }
}


/* =========================================
   Reset Form
========================================= */

function resetProductForm() {

    editingProductId =
        null;


    productIdInput.value =
        "";


    productForm.reset();


    productAvailableInput.checked =
        true;


    productSortOrderInput.value =
        0;


    productFormTitle.textContent =
        "Ø§ÙØ²ÙˆØ¯Ù† Ù…Ø­ØµÙˆÙ„ Ø¬Ø¯ÛŒØ¯";


    productSubmitButton.textContent =
        "Ø§ÙØ²ÙˆØ¯Ù† Ù…Ø­ØµÙˆÙ„";


    productCancelButton.hidden =
        true;


    clearProductMessage();
}


/* =========================================
   Loading
========================================= */

function setProductFormLoading(
    loading
) {

    productSubmitButton.disabled =
        loading;

    productCancelButton.disabled =
        loading;


    if (loading) {

        productSubmitButton.textContent =
            "Ø¯Ø± Ø­Ø§Ù„ Ø°Ø®ÛŒØ±Ù‡...";

    } else {

        productSubmitButton.textContent =
            editingProductId
                ? "Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª"
                : "Ø§ÙØ²ÙˆØ¯Ù† Ù…Ø­ØµÙˆÙ„";
    }
}


/* =========================================
   Messages
========================================= */

function showProductMessage(
    message,
    type
) {

    productMessage.textContent =
        message;

    productMessage.className =
        `product-message ${type}`;
}


function clearProductMessage() {

    productMessage.textContent =
        "";

    productMessage.className =
        "product-message";
}


/* =========================================
   Helpers
========================================= */

function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("fa-IR");
}


function toPersianNumber(value) {

    return String(value)
        .replace(
            /\d/g,
            digit =>
                "Û°Û±Û²Û³Û´ÛµÛ¶Û·Û¸Û¹"[digit]
        );
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
initializeProducts();
