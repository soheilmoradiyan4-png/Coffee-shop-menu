const {
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../services/adminProductService");

async function getProductsController(req, res) {
    try {
        const products =
            await getAdminProducts();

        return res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error(
            "getProductsController:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function createProductController(req, res) {
    try {
        const product =
            await createProduct(req.body);

        return res.status(201).json({
            success: true,
            message: "محصول با موفقیت ایجاد شد.",
            data: product
        });
    } catch (error) {
        console.error(
            "createProductController:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function updateProductController(req, res) {
    try {
        const product =
            await updateProduct(
                req.params.id,
                req.body
            );

        return res.json({
            success: true,
            message: "محصول با موفقیت ویرایش شد.",
            data: product
        });
    } catch (error) {
        console.error(
            "updateProductController:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function deleteProductController(req, res) {
    try {
        await deleteProduct(
            req.params.id
        );

        return res.json({
            success: true,
            message: "محصول با موفقیت حذف شد."
        });
    } catch (error) {
        console.error(
            "deleteProductController:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getProductsController,
    createProductController,
    updateProductController,
    deleteProductController
};