const PRODUCT_CATEGORY_API_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api/admin/categories"
        : "/api/admin/categories";


const categoryElements = {

    form:
        document.getElementById(
            "category-form"
        ),

    id:
        document.getElementById(
            "category-id"
        ),

    name:
        document.getElementById(
            "category-name"
        ),

    slug:
        document.getElementById(
            "category-slug"
        ),

    sortOrder:
        document.getElementById(
            "category-sort-order"
        ),

    isActive:
        document.getElementById(
            "category-is-active"
        ),

    submit:
        document.getElementById(
            "category-submit"
        ),

    cancel:
        document.getElementById(
            "category-cancel"
        ),

    formTitle:
        document.getElementById(
            "category-form-title"
        ),

    message:
        document.getElementById(
            "category-message"
        ),

    container:
        document.getElementById(
            "categories-container"
        ),

    count:
        document.getElementById(
            "categories-count"
        )

};


document.addEventListener(
    "DOMContentLoaded",
    initializeCategories
);


function initializeCategories() {

    if (
        !categoryElements.form ||
        !categoryElements.container
    ) {
        return;
    }


    setupCategoryEvents();

    loadCategories();

}


function setupCategoryEvents() {

    categoryElements.form.addEventListener(
        "submit",
        handleCategorySubmit
    );


    categoryElements.cancel.addEventListener(
        "click",
        resetCategoryForm
    );


    categoryElements.container.addEventListener(
        "click",
        handleCategoryAction
    );

}


async function loadCategories() {

    showCategoryMessage(
        "در حال دریافت دسته‌بندی‌ها...",
        "loading"
    );


    try {

        const response =
            await fetch(
                PRODUCT_CATEGORY_API_URL,
                {
                    credentials:
                        "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "خطا در دریافت دسته‌بندی‌ها."
            );

        }


        renderCategories(
            result.data || []
        );


        showCategoryMessage(
            "دسته‌بندی‌ها با موفقیت دریافت شدند.",
            "success"
        );


    } catch (error) {

        console.error(
            "Load categories error:",
            error
        );


        showCategoryMessage(
            error.message ||
            "خطا در دریافت دسته‌بندی‌ها.",
            "error"
        );

    }

}


function renderCategories(categories) {

    categoryElements.count.textContent =
        `${toPersianNumber(categories.length)} دسته‌بندی`;


    if (!categories.length) {

        categoryElements.container.innerHTML = `

            <div class="category-empty">

                <div class="category-empty-icon">
                    🗂️
                </div>

                <h3>
                    هنوز دسته‌بندی‌ای وجود ندارد
                </h3>

                <p>
                    اولین دسته‌بندی منوی خود را ایجاد کنید.
                </p>

            </div>

        `;

        return;

    }


    categoryElements.container.innerHTML =
        categories
            .map(renderCategoryCard)
            .join("");

}


function renderCategoryCard(category) {

    const activeClass =
        category.is_active
            ? "category-active"
            : "category-inactive";


    const activeText =
        category.is_active
            ? "فعال"
            : "غیرفعال";


    const activeIcon =
        category.is_active
            ? "🟢"
            : "⚪";


    return `

        <article
            class="category-card ${activeClass}"
            data-category-id="${category.id}"
        >

            <div class="category-card-main">

                <div class="category-card-title">

                    <h3>
                        ${escapeHtml(category.name)}
                    </h3>

                    <span
                        class="category-status"
                    >
                        ${activeIcon}
                        ${activeText}
                    </span>

                </div>


                <div class="category-card-meta">

                    <span dir="ltr">
                        ${escapeHtml(category.slug)}
                    </span>

                    <span>
                        ترتیب:
                        ${toPersianNumber(
                            category.sort_order
                        )}
                    </span>

                </div>

            </div>


            <div class="category-card-actions">

                <button
                    type="button"
                    class="category-edit-btn"
                    data-action="edit"
                    data-id="${category.id}"
                >
                    ✏️ ویرایش
                </button>


                <button
                    type="button"
                    class="category-toggle-btn"
                    data-action="toggle"
                    data-id="${category.id}"
                >
                    ${category.is_active
                        ? "⚪ غیرفعال"
                        : "🟢 فعال"
                    }
                </button>


                <button
                    type="button"
                    class="category-delete-btn"
                    data-action="delete"
                    data-id="${category.id}"
                >
                    🗑️ حذف
                </button>

            </div>

        </article>

    `;

}


async function handleCategorySubmit(event) {

    event.preventDefault();


    const categoryId =
        categoryElements.id.value;


    const name =
        categoryElements.name.value.trim();


    const slug =
        categoryElements.slug.value.trim()
            .toLowerCase();


    const sortOrder =
        Number(
            categoryElements.sortOrder.value
        );


    const isActive =
        categoryElements.isActive.checked;


    if (!name) {

        showCategoryMessage(
            "نام دسته‌بندی را وارد کنید.",
            "error"
        );

        return;

    }


    if (!/^[a-z0-9-]+$/.test(slug)) {

        showCategoryMessage(
            "Slug فقط می‌تواند شامل حروف انگلیسی، عدد و خط تیره باشد.",
            "error"
        );

        return;

    }


    if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
    ) {

        showCategoryMessage(
            "ترتیب نمایش نامعتبر است.",
            "error"
        );

        return;

    }


    const payload = {

        name,

        slug,

        sort_order:
            sortOrder,

        is_active:
            isActive

    };


    const isEditing =
        Boolean(categoryId);


    setCategoryFormLoading(
        true
    );


    try {

        const url =
            isEditing
                ? `${PRODUCT_CATEGORY_API_URL}/${categoryId}`
                : PRODUCT_CATEGORY_API_URL;


        const method =
            isEditing
                ? "PATCH"
                : "POST";


        const response =
            await fetch(
                url,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "عملیات ناموفق بود."
            );

        }


        showCategoryMessage(
            result.message ||
            (
                isEditing
                    ? "دسته‌بندی با موفقیت ویرایش شد."
                    : "دسته‌بندی با موفقیت ایجاد شد."
            ),
            "success"
        );


        resetCategoryForm();


        await loadCategories();


    } catch (error) {

        console.error(
            "Save category error:",
            error
        );


        showCategoryMessage(
            error.message ||
            "خطا در ذخیره دسته‌بندی.",
            "error"
        );

    } finally {

        setCategoryFormLoading(
            false
        );

    }

}


function handleCategoryAction(event) {

    const button =
        event.target.closest(
            "button[data-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.action;


    const id =
        button.dataset.id;


    if (action === "edit") {

        editCategory(id);

        return;

    }


    if (action === "toggle") {

        toggleCategory(id);

        return;

    }


    if (action === "delete") {

        deleteCategory(id);

    }

}


async function editCategory(categoryId) {

    try {

        const response =
            await fetch(
                PRODUCT_CATEGORY_API_URL,
                {
                    credentials:
                        "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "خطا در دریافت دسته‌بندی‌ها."
            );

        }


        const category =
            (result.data || [])
                .find(
                    item =>
                        String(item.id) ===
                        String(categoryId)
                );


        if (!category) {

            throw new Error(
                "دسته‌بندی موردنظر پیدا نشد."
            );

        }


        categoryElements.id.value =
            category.id;


        categoryElements.name.value =
            category.name;


        categoryElements.slug.value =
            category.slug;


        categoryElements.sortOrder.value =
            category.sort_order;


        categoryElements.isActive.checked =
            category.is_active;


        categoryElements.formTitle.textContent =
            "ویرایش دسته‌بندی";


        categoryElements.submit.textContent =
            "💾 ذخیره تغییرات";


        categoryElements.cancel.hidden =
            false;


        categoryElements.name.focus();


        showCategoryMessage(
            "دسته‌بندی برای ویرایش انتخاب شد.",
            "loading"
        );


        window.scrollTo({
            top:
                categoryElements.form
                    .getBoundingClientRect()
                    .top +
                window.scrollY -
                100,

            behavior:
                "smooth"
        });


    } catch (error) {

        console.error(
            "Edit category error:",
            error
        );


        showCategoryMessage(
            error.message ||
            "خطا در آماده‌سازی ویرایش.",
            "error"
        );

    }

}


async function toggleCategory(categoryId) {

    try {

        const response =
            await fetch(
                PRODUCT_CATEGORY_API_URL,
                {
                    credentials:
                        "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "خطا در دریافت دسته‌بندی."
            );

        }


        const category =
            (result.data || [])
                .find(
                    item =>
                        String(item.id) ===
                        String(categoryId)
                );


        if (!category) {

            throw new Error(
                "دسته‌بندی موردنظر پیدا نشد."
            );

        }


        const responseUpdate =
            await fetch(
                `${PRODUCT_CATEGORY_API_URL}/${categoryId}`,
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({
                            is_active:
                                !category.is_active
                        })
                }
            );


        const updateResult =
            await responseUpdate.json();


        if (
            responseUpdate.status === 401
        ) {

            window.location.href =
                "admin-login.html";

            return;

        }


        if (!responseUpdate.ok) {

            throw new Error(
                updateResult.message ||
                "خطا در تغییر وضعیت دسته‌بندی."
            );

        }


        showCategoryMessage(
            "وضعیت دسته‌بندی تغییر کرد.",
            "success"
        );


        await loadCategories();


    } catch (error) {

        console.error(
            "Toggle category error:",
            error
        );


        showCategoryMessage(
            error.message ||
            "خطا در تغییر وضعیت دسته‌بندی.",
            "error"
        );

    }

}


async function deleteCategory(categoryId) {

    const confirmed =
        window.confirm(
            "آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${PRODUCT_CATEGORY_API_URL}/${categoryId}`,
                {
                    method:
                        "DELETE",

                    credentials:
                        "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "خطا در حذف دسته‌بندی."
            );

        }


        showCategoryMessage(
            result.message ||
            "دسته‌بندی با موفقیت حذف شد.",
            "success"
        );


        await loadCategories();


    } catch (error) {

        console.error(
            "Delete category error:",
            error
        );


        showCategoryMessage(
            error.message ||
            "خطا در حذف دسته‌بندی.",
            "error"
        );

    }

}


function resetCategoryForm() {

    categoryElements.form.reset();


    categoryElements.id.value =
        "";


    categoryElements.sortOrder.value =
        "0";


    categoryElements.isActive.checked =
        true;


    categoryElements.formTitle.textContent =
        "افزودن دسته‌بندی جدید";


    categoryElements.submit.textContent =
        "➕ افزودن دسته‌بندی";


    categoryElements.cancel.hidden =
        true;

}


function setCategoryFormLoading(
    isLoading
) {

    categoryElements.submit.disabled =
        isLoading;


    categoryElements.cancel.disabled =
        isLoading;


    categoryElements.submit.textContent =
        isLoading
            ? "در حال ذخیره..."
            : (
                categoryElements.id.value
                    ? "💾 ذخیره تغییرات"
                    : "➕ افزودن دسته‌بندی"
            );

}


function showCategoryMessage(
    message,
    type
) {

    categoryElements.message.textContent =
        message;


    categoryElements.message.className =
        `category-message ${type}`;

}


function toPersianNumber(number) {

    return Number(number)
        .toLocaleString("fa-IR");

}


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
