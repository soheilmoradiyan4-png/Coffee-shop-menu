const supabase = require("../config/supabase");

function validateProductId(id) {
    const productId = Number(id);

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new Error("شناسه محصول نامعتبر است.");
    }

    return productId;
}

function validateProductName(name) {
    if (typeof name !== "string") {
        throw new Error("نام محصول نامعتبر است.");
    }

    const cleanName = name.trim();

    if (!cleanName) {
        throw new Error("نام محصول الزامی است.");
    }

    if (cleanName.length > 150) {
        throw new Error(
            "نام محصول نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد."
        );
    }

    return cleanName;
}

function validateDescription(description) {
    if (
        description === undefined ||
        description === null
    ) {
        return null;
    }

    if (typeof description !== "string") {
        throw new Error("توضیحات محصول نامعتبر است.");
    }

    const cleanDescription = description.trim();

    if (!cleanDescription) {
        return null;
    }

    return cleanDescription;
}

function validatePrice(price) {
    const numericPrice = Number(price);

    if (
        !Number.isInteger(numericPrice) ||
        numericPrice < 0
    ) {
        throw new Error(
            "قیمت محصول باید یک عدد صحیح و بزرگ‌تر یا مساوی صفر باشد."
        );
    }

    return numericPrice;
}

function validateSortOrder(sortOrder) {
    const numericSortOrder = Number(sortOrder);

    if (
        !Number.isInteger(numericSortOrder) ||
        numericSortOrder < 0
    ) {
        throw new Error(
            "ترتیب نمایش باید یک عدد صحیح بزرگ‌تر یا مساوی صفر باشد."
        );
    }

    return numericSortOrder;
}

function validateAvailable(available) {
    if (typeof available !== "boolean") {
        throw new Error(
            "وضعیت موجودی محصول نامعتبر است."
        );
    }

    return available;
}

async function validateCategoryId(categoryId) {
    if (
        categoryId === null ||
        categoryId === undefined ||
        categoryId === ""
    ) {
        return null;
    }

    const numericCategoryId = Number(categoryId);

    if (
        !Number.isInteger(numericCategoryId) ||
        numericCategoryId <= 0
    ) {
        throw new Error(
            "شناسه دسته‌بندی نامعتبر است."
        );
    }

    const { data, error } = await supabase
        .from("categories")
        .select("id")
        .eq("id", numericCategoryId)
        .maybeSingle();

    if (error) {
        throw new Error(
            "خطا در بررسی دسته‌بندی محصول."
        );
    }

    if (!data) {
        throw new Error(
            "دسته‌بندی انتخاب‌شده وجود ندارد."
        );
    }

    return numericCategoryId;
}

async function getAdminProducts() {
    const { data, error } = await supabase
        .from("products")
        .select(`
            id,
            name,
            description,
            price,
            available,
            sort_order,
            category_id,
            created_at,
            updated_at,
            category:categories (
                id,
                name,
                slug
            )
        `)
        .order("sort_order", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });

    if (error) {
        throw new Error(
            "خطا در دریافت محصولات."
        );
    }

    return data || [];
}

async function createProduct(productData) {
    const name = validateProductName(
        productData.name
    );

    const description = validateDescription(
        productData.description
    );

    const price = validatePrice(
        productData.price
    );

    const categoryId = await validateCategoryId(
        productData.category_id
    );

    const sortOrder = validateSortOrder(
        productData.sort_order ?? 0
    );

    const available = validateAvailable(
        productData.available ?? true
    );

    const { data, error } = await supabase
        .from("products")
        .insert({
            name,
            description,
            price,
            category_id: categoryId,
            sort_order: sortOrder,
            available
        })
        .select(`
            id,
            name,
            description,
            price,
            available,
            sort_order,
            category_id,
            created_at,
            updated_at,
            category:categories (
                id,
                name,
                slug
            )
        `)
        .single();

    if (error) {
        throw new Error(
            "خطا در ایجاد محصول."
        );
    }

    return data;
}

async function updateProduct(productId, productData) {
    const id = validateProductId(productId);

    const name = validateProductName(
        productData.name
    );

    const description = validateDescription(
        productData.description
    );

    const price = validatePrice(
        productData.price
    );

    const categoryId = await validateCategoryId(
        productData.category_id
    );

    const sortOrder = validateSortOrder(
        productData.sort_order ?? 0
    );

    const available = validateAvailable(
        productData.available ?? true
    );

    const { data, error } = await supabase
        .from("products")
        .update({
            name,
            description,
            price,
            category_id: categoryId,
            sort_order: sortOrder,
            available,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select(`
            id,
            name,
            description,
            price,
            available,
            sort_order,
            category_id,
            created_at,
            updated_at,
            category:categories (
                id,
                name,
                slug
            )
        `)
        .single();

    if (error) {
        throw new Error(
            "محصول موردنظر پیدا نشد یا ویرایش آن انجام نشد."
        );
    }

    return data;
}

async function deleteProduct(productId) {
    const id = validateProductId(productId);

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(
            "حذف محصول انجام نشد."
        );
    }

    return true;
}

module.exports = {
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct
};