const {
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../services/adminProductService");

async function getProductsController(c) {

    try {

        const products = await getAdminProducts();

        return c.json({ success: true, data: products });

    } catch (error) {

        console.error("getProductsController:", error);

        return c.json({
            success: false,
            message: error.message
        }, 500);
    }
}

async function createProductController(c) {

    try {

        const body = await c.req.json().catch(() => ({}));

        const product = await createProduct(body);

        return c.json({
            success: true,
            message: "محصول با موفقیت ایجاد شد.",
            data: product
        }, 201);

    } catch (error) {

        console.error("createProductController:", error);

        return c.json({
            success: false,
            message: error.message
        }, 400);
    }
}

async function updateProductController(c) {

    try {

        const body = await c.req.json().catch(() => ({}));

        const product = await updateProduct(
            c.req.param("id"),
            body
        );

        return c.json({
            success: true,
            message: "محصول با موفقیت ویرایش شد.",
            data: product
        });

    } catch (error) {

        console.error("updateProductController:", error);

        return c.json({
            success: false,
            message: error.message
        }, 400);
    }
}

async function deleteProductController(c) {

    try {

        await deleteProduct(c.req.param("id"));

        return c.json({
            success: true,
            message: "محصول با موفقیت حذف شد."
        });

    } catch (error) {

        console.error("deleteProductController:", error);

        return c.json({
            success: false,
            message: error.message
        }, 400);
    }
}

module.exports = {
    getProductsController,
    createProductController,
    updateProductController,
    deleteProductController
};
