const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api"
        : "/api";

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
        "Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§...",
        "loading"
    );


    try {

        const response =
            await fetch(
                PRODUCT_CATEGORY_API_URL,
                {
                    credentials: "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "/admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§."
            );

        }


        renderCategories(
            result.data || []
        );


        showCategoryMessage(
            "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¯Ø±ÛŒØ§ÙØª Ø´Ø¯Ù†Ø¯.",
            "success"
        );


    } catch (error) {

        console.error(
            "Load categories error:",
            error
        );


        showCategoryMessage(
            error.message ||
            "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§.",
            "error"
        );

    }

}


function renderCategories(categories) {

    categoryElements.count.textContent =
        `${toPersianNumber(categories.length)} Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ`;


    if (!categories.length) {

        categoryElements.container.innerHTML = `

            <div class="category-empty">

                <div class="category-empty-icon">
                    ðŸ—‚ï¸
                </div>

                <h3>
                    Ù‡Ù†ÙˆØ² Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒØ§ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯
                </h3>

                <p>
                    Ø§ÙˆÙ„ÛŒÙ† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ù…Ù†ÙˆÛŒ Ø®ÙˆØ¯ Ø±Ø§ Ø§ÛŒØ¬Ø§Ø¯ Ú©Ù†ÛŒØ¯.
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
            ? "ÙØ¹Ø§Ù„"
            : "ØºÛŒØ±ÙØ¹Ø§Ù„";


    const activeIcon =
        category.is_active
            ? "ðŸŸ¢"
            : "âšª";


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
                        ØªØ±ØªÛŒØ¨:
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
                    âœï¸ ÙˆÛŒØ±Ø§ÛŒØ´
                </button>


                <button
                    type="button"
                    class="category-toggle-btn"
                    data-action="toggle"
                    data-id="${category.id}"
                >
                    ${category.is_active
                        ? "âšª ØºÛŒØ±ÙØ¹Ø§Ù„"
                        : "ðŸŸ¢ ÙØ¹Ø§Ù„"
                    }
                </button>


                <button
                    type="button"
                    class="category-delete-btn"
                    data-action="delete"
                    data-id="${category.id}"
                >
                    ðŸ—‘ï¸ Ø­Ø°Ù
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
            "Ù†Ø§Ù… Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.",
            "error"
        );

        return;

    }


    if (!/^[a-z0-9-]+$/.test(slug)) {

        showCategoryMessage(
            "Slug ÙÙ‚Ø· Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø´Ø§Ù…Ù„ Ø­Ø±ÙˆÙ Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒØŒ Ø¹Ø¯Ø¯ Ùˆ Ø®Ø· ØªÛŒØ±Ù‡ Ø¨Ø§Ø´Ø¯.",
            "error"
        );

        return;

    }


    if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
    ) {

        showCategoryMessage(
            "ØªØ±ØªÛŒØ¨ Ù†Ù…Ø§ÛŒØ´ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.",
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

                    credentials: "include",

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
                "/admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø¹Ù…Ù„ÛŒØ§Øª Ù†Ø§Ù…ÙˆÙÙ‚ Ø¨ÙˆØ¯."
            );

        }


        showCategoryMessage(
            result.message ||
            (
                isEditing
                    ? "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª ÙˆÛŒØ±Ø§ÛŒØ´ Ø´Ø¯."
                    : "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯."
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
            "Ø®Ø·Ø§ Ø¯Ø± Ø°Ø®ÛŒØ±Ù‡ Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ.",
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
                    credentials: "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "/admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§."
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
                "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ù…ÙˆØ±Ø¯Ù†Ø¸Ø± Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯."
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
            "ÙˆÛŒØ±Ø§ÛŒØ´ Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ";


        categoryElements.submit.textContent =
            "ðŸ’¾ Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª";


        categoryElements.cancel.hidden =
            false;


        categoryElements.name.focus();


        showCategoryMessage(
            "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø±Ø§ÛŒ ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯.",
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
            "Ø®Ø·Ø§ Ø¯Ø± Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ ÙˆÛŒØ±Ø§ÛŒØ´.",
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
                    credentials: "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "/admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ."
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
                "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ù…ÙˆØ±Ø¯Ù†Ø¸Ø± Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯."
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

                    credentials: "include",

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
                "/admin-login.html";

            return;

        }


        if (!responseUpdate.ok) {

            throw new Error(
                updateResult.message ||
                "Ø®Ø·Ø§ Ø¯Ø± ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ."
            );

        }


        showCategoryMessage(
            "ÙˆØ¶Ø¹ÛŒØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ ØªØºÛŒÛŒØ± Ú©Ø±Ø¯.",
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
            "Ø®Ø·Ø§ Ø¯Ø± ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ.",
            "error"
        );

    }

}


async function deleteCategory(categoryId) {

    const confirmed =
        window.confirm(
            "Ø¢ÛŒØ§ Ù…Ø·Ù…Ø¦Ù† Ù‡Ø³ØªÛŒØ¯ Ú©Ù‡ Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡ÛŒØ¯ Ø§ÛŒÙ† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø±Ø§ Ø­Ø°Ù Ú©Ù†ÛŒØ¯ØŸ"
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

                    credentials: "include"
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            window.location.href =
                "/admin-login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ."
            );

        }


        showCategoryMessage(
            result.message ||
            "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø­Ø°Ù Ø´Ø¯.",
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
            "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ.",
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
        "Ø§ÙØ²ÙˆØ¯Ù† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¬Ø¯ÛŒØ¯";


    categoryElements.submit.textContent =
        "âž• Ø§ÙØ²ÙˆØ¯Ù† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ";


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
            ? "Ø¯Ø± Ø­Ø§Ù„ Ø°Ø®ÛŒØ±Ù‡..."
            : (
                categoryElements.id.value
                    ? "ðŸ’¾ Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª"
                    : "âž• Ø§ÙØ²ÙˆØ¯Ù† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ"
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
