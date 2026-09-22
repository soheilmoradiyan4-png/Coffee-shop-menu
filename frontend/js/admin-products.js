const PRODUCT_API_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api/admin/products"
        : "/api/admin/products";

// نکته: PRODUCT_CATEGORY_API_URL اینجا عمداً دوباره تعریف نشده،
// چون همین اسم قبلاً توی admin-categories.js (که قبل از این فایل لود میشه)
// تعریف شده و استفاده میشه. دوباره تعریف کردنش با همون اسم باعث خطای
// "Identifier has already been declared" میشه و کل اسکریپت این فایل
// اجرا نمیشه. اگه فایل‌ها رو جدا/مستقل کردی، این خط رو برگردون:
// const PRODUCT_CATEGORY_API_URL = "http://127.0.0.1:8787/api/admin/categories";

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
            "در حال دریافت دسته‌بندی‌های محصولات..."
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
                "admin-login.html";

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
                "خطا در دریافت دسته‌بندی‌ها."
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
            "خطا در دریافت دسته‌بندی‌ها.",
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
            انتخاب دسته‌بندی
        </option>
    `;


    if (!categories.length) {

        console.warn(
            "هیچ دسته‌بندی‌ای دریافت نشد."
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
        "دسته‌بندی‌های فرم:",
        categories
    );
}

/* =========================================
   Load Products
========================================= */

async function loadProducts() {

    productsContainer.innerHTML = `
        <div class="products-loading">
            در حال دریافت محصولات...
        </div>
    `;


    try {

        console.log(
            "در حال دریافت محصولات..."
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
                "admin-login.html";

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
                "خطا در دریافت محصولات."
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
                    "خطا در دریافت محصولات."
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
        `${toPersianNumber(products.length)} محصول`;


    if (!products.length) {

        productsContainer.innerHTML = `
            <div class="products-empty">
                هنوز محصولی ثبت نشده است.
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
        "بدون دسته‌بندی";


    const availabilityClass =
        product.available
            ? "available"
            : "unavailable";


    const availabilityText =
        product.available
            ? "موجود"
            : "ناموجود";


    const toggleText =
        product.available
            ? "غیرفعال کردن"
            : "فعال کردن";


    const description =
        product.description
            ? escapeHtml(product.description)
            : "بدون توضیحات";


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
                        💰
                        ${formatPrice(product.price)}
                        تومان
                    </span>

                    <span>
                        ترتیب:
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
                    ✏️ ویرایش
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
                    🗑️ حذف
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
        "ویرایش محصول";


    productSubmitButton.textContent =
        "ذخیره تغییرات";


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
            "نام محصول را وارد کنید.",
            "error"
        );

        return;
    }


    if (!categoryId) {

        showProductMessage(
            "دسته‌بندی محصول را انتخاب کنید.",
            "error"
        );

        return;
    }


    if (
        !Number.isInteger(price) ||
        price < 0
    ) {

        showProductMessage(
            "قیمت محصول نامعتبر است.",
            "error"
        );

        return;
    }


    if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
    ) {

        showProductMessage(
            "ترتیب نمایش نامعتبر است.",
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

                    credentials:
                        "include",

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
                "admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "عملیات محصول انجام نشد."
            );
        }


        showProductMessage(
            result.message ||
            (
                isEditing
                    ? "محصول با موفقیت ویرایش شد."
                    : "محصول با موفقیت اضافه شد."
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
            "خطا در ذخیره محصول.",
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

                    credentials:
                        "include",

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
                "admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "تغییر وضعیت محصول انجام نشد."
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
            "خطا در تغییر وضعیت محصول.",
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
            `آیا از حذف «${product.name}» مطمئن هستید؟`
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

                    credentials:
                        "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "حذف محصول انجام نشد."
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
            "محصول با موفقیت حذف شد.",
            "success"
        );

    } catch (error) {

        console.error(
            "deleteProduct:",
            error
        );


        showProductMessage(
            error.message ||
            "خطا در حذف محصول.",
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
        "افزودن محصول جدید";


    productSubmitButton.textContent =
        "افزودن محصول";


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
            "در حال ذخیره...";

    } else {

        productSubmitButton.textContent =
            editingProductId
                ? "ذخیره تغییرات"
                : "افزودن محصول";
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
                "۰۱۲۳۴۵۶۷۸۹"[digit]
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
