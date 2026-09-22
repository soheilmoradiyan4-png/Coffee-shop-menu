const supabase = require("../config/supabase");

function validateCategoryId(categoryId) {
    const id = Number(categoryId);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("شناسه دسته‌بندی نامعتبر است.");
    }

    return id;
}


function validateCategoryName(name) {

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        throw new Error(
            "نام دسته‌بندی الزامی است."
        );
    }


    const normalizedName =
        name.trim();


    if (normalizedName.length > 100) {
        throw new Error(
            "نام دسته‌بندی نباید بیشتر از ۱۰۰ کاراکتر باشد."
        );
    }


    return normalizedName;
}


function validateSlug(slug) {

    if (
        typeof slug !== "string" ||
        !slug.trim()
    ) {
        throw new Error(
            "Slug دسته‌بندی الزامی است."
        );
    }


    const normalizedSlug =
        slug.trim().toLowerCase();


    if (
        normalizedSlug.length > 120
    ) {
        throw new Error(
            "Slug دسته‌بندی نباید بیشتر از ۱۲۰ کاراکتر باشد."
        );
    }


    if (
        !/^[a-z0-9-]+$/.test(
            normalizedSlug
        )
    ) {
        throw new Error(
            "Slug فقط می‌تواند شامل حروف انگلیسی، عدد و خط تیره باشد."
        );
    }


    return normalizedSlug;
}


function validateSortOrder(sortOrder) {

    if (
        sortOrder === undefined ||
        sortOrder === null ||
        sortOrder === ""
    ) {
        return 0;
    }


    const value =
        Number(sortOrder);


    if (
        !Number.isInteger(value) ||
        value < 0
    ) {
        throw new Error(
            "ترتیب نمایش نامعتبر است."
        );
    }


    return value;
}


async function getAdminCategories() {

    const {
        data,
        error
    } = await supabase
        .from("categories")
        .select(`
            id,
            name,
            slug,
            is_active,
            sort_order,
            created_at,
            updated_at
        `)
        .order(
            "sort_order",
            {
                ascending: true
            }
        )
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (error) {
        throw error;
    }


    return data;
}


async function createCategory(data) {

    const name =
        validateCategoryName(
            data.name
        );


    const slug =
        validateSlug(
            data.slug
        );


    const sortOrder =
        validateSortOrder(
            data.sort_order
        );


    const isActive =
        data.is_active === undefined
            ? true
            : Boolean(data.is_active);


    const {
        data: category,
        error
    } = await supabase
        .from("categories")
        .insert({
            name,
            slug,
            sort_order: sortOrder,
            is_active: isActive
        })
        .select(`
            id,
            name,
            slug,
            is_active,
            sort_order,
            created_at,
            updated_at
        `)
        .single();


    if (error) {

        if (
            error.code === "23505"
        ) {
            throw new Error(
                "این Slug قبلاً استفاده شده است."
            );
        }

        throw error;
    }


    return category;
}


async function updateCategory(
    categoryId,
    data
) {

    const id =
        validateCategoryId(
            categoryId
        );


    const updates = {};


    if (
        data.name !== undefined
    ) {
        updates.name =
            validateCategoryName(
                data.name
            );
    }


    if (
        data.slug !== undefined
    ) {
        updates.slug =
            validateSlug(
                data.slug
            );
    }


    if (
        data.sort_order !== undefined
    ) {
        updates.sort_order =
            validateSortOrder(
                data.sort_order
            );
    }


    if (
        data.is_active !== undefined
    ) {
        updates.is_active =
            Boolean(data.is_active);
    }


    if (
        Object.keys(updates).length === 0
    ) {
        throw new Error(
            "هیچ اطلاعاتی برای ویرایش ارسال نشده است."
        );
    }


    updates.updated_at =
        new Date().toISOString();


    const {
        data: category,
        error
    } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select(`
            id,
            name,
            slug,
            is_active,
            sort_order,
            created_at,
            updated_at
        `)
        .single();


    if (error) {

        if (
            error.code === "23505"
        ) {
            throw new Error(
                "این Slug قبلاً استفاده شده است."
            );
        }

        throw error;
    }


    return category;
}


async function deleteCategory(
    categoryId
) {

    const id =
        validateCategoryId(
            categoryId
        );


    const {
        count,
        error: countError
    } = await supabase
        .from("products")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "category_id",
            id
        );


    if (countError) {
        throw countError;
    }


    if (count > 0) {
        throw new Error(
            "این دسته‌بندی دارای محصول است و فعلاً قابل حذف نیست."
        );
    }


    const {
        error
    } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);


    if (error) {
        throw error;
    }


    return true;
}


module.exports = {

    getAdminCategories,

    createCategory,

    updateCategory,

    deleteCategory

};