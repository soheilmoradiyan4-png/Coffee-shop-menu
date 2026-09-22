const {
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../services/adminCategoryService");

async function getCategoriesController(c) {

    try {

        const categories = await getAdminCategories();

        return c.json({ success: true, data: categories });

    } catch (error) {

        console.error("Get admin categories error:", error);

        return c.json({
            success: false,
            message: "خطا در دریافت دسته‌بندی‌ها."
        }, 500);
    }
}

async function createCategoryController(c) {

    try {

        const body = await c.req.json().catch(() => ({}));

        const category = await createCategory(body);

        return c.json({
            success: true,
            message: "دسته‌بندی با موفقیت ایجاد شد.",
            data: category
        }, 201);

    } catch (error) {

        console.error("Create category error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در ایجاد دسته‌بندی."
        }, 400);
    }
}

async function updateCategoryController(c) {

    try {

        const body = await c.req.json().catch(() => ({}));

        const category = await updateCategory(
            c.req.param("id"),
            body
        );

        return c.json({
            success: true,
            message: "دسته‌بندی با موفقیت ویرایش شد.",
            data: category
        });

    } catch (error) {

        console.error("Update category error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در ویرایش دسته‌بندی."
        }, 400);
    }
}

async function deleteCategoryController(c) {

    try {

        await deleteCategory(c.req.param("id"));

        return c.json({
            success: true,
            message: "دسته‌بندی با موفقیت حذف شد."
        });

    } catch (error) {

        console.error("Delete category error:", error);

        return c.json({
            success: false,
            message: error.message || "خطا در حذف دسته‌بندی."
        }, 400);
    }
}

module.exports = {
    getCategoriesController,
    createCategoryController,
    updateCategoryController,
    deleteCategoryController
};
