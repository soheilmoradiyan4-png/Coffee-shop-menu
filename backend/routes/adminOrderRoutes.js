const express = require("express");

const {
    getOrdersController,
    updateOrderStatusController
} = require("../controllers/adminOrderController");

const {
    requireAdmin
} = require("../middleware/adminAuthMiddleware");


const router = express.Router();


router.use(requireAdmin);


router.get(
    "/",
    getOrdersController
);


router.patch(
    "/:id/status",
    updateOrderStatusController
);


module.exports = router;