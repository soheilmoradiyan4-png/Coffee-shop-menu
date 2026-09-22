const {
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../services/adminCategoryService");


async function getCategoriesController(
    req,
    res
) {

    try {

        const categories =
            await getAdminCategories();


        res.json({
            success: true,
            data: categories
        });

    } catch (error) {

        console.error(
            "Get admin categories error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "خطا در دریافت دسته‌بندی‌ها."

        });

    }

}


async function createCategoryController(
    req,
    res
) {

    try {

        const category =
            await createCategory(
                req.body
            );


        res.status(201).json({

            success: true,

            message:
                "دسته‌بندی با موفقیت ایجاد شد.",

            data: category

        });

    } catch (error) {

        console.error(
            "Create category error:",
            error
        );


        res.status(400).json({

            success: false,

            message:
                error.message ||
                "خطا در ایجاد دسته‌بندی."

        });

    }

}


async function updateCategoryController(
    req,
    res
) {

    try {

        const category =
            await updateCategory(
                req.params.id,
                req.body
            );


        res.json({

            success: true,

            message:
                "دسته‌بندی با موفقیت ویرایش شد.",

            data: category

        });

    } catch (error) {

        console.error(
            "Update category error:",
            error
        );


        res.status(400).json({

            success: false,

            message:
                error.message ||
                "خطا در ویرایش دسته‌بندی."

        });

    }

}


async function deleteCategoryController(
    req,
    res
) {

    try {

        await deleteCategory(
            req.params.id
        );


        res.json({

            success: true,

            message:
                "دسته‌بندی با موفقیت حذف شد."

        });

    } catch (error) {

        console.error(
            "Delete category error:",
            error
        );


        res.status(400).json({

            success: false,

            message:
                error.message ||
                "خطا در حذف دسته‌بندی."

        });

    }

}


module.exports = {

    getCategoriesController,

    createCategoryController,

    updateCategoryController,

    deleteCategoryController

};