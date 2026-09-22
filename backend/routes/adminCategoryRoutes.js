const express = require("express");

const {
    getCategoriesController,
    createCategoryController,
    updateCategoryController,
    deleteCategoryController
} = require("../controllers/adminCategoryController");

const {
    requireAdmin
} = require("../middleware/adminAuthMiddleware");


const router =
    express.Router();


router.use(
    requireAdmin
);


router.get(
    "/",
    getCategoriesController
);


router.post(
    "/",
    createCategoryController
);


router.patch(
    "/:id",
    updateCategoryController
);


router.delete(
    "/:id",
    deleteCategoryController
);


module.exports = router;