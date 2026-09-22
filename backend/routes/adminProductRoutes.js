const express = require("express");

const {
    getProductsController,
    createProductController,
    updateProductController,
    deleteProductController
} = require("../controllers/adminProductController");

const {
    requireAdmin
} = require("../middleware/adminAuthMiddleware");

const router = express.Router();

router.use(requireAdmin);

router.get(
    "/",
    getProductsController
);

router.post(
    "/",
    createProductController
);

router.patch(
    "/:id",
    updateProductController
);

router.delete(
    "/:id",
    deleteProductController
);

module.exports = router;