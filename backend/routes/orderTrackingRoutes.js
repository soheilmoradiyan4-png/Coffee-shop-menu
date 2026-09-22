const express = require("express");

const {
    getOrderByTrackingCodeController
} = require("../controllers/orderTrackingController");

const router =
    express.Router();

router.get(
    "/:trackingCode",
    getOrderByTrackingCodeController
);

module.exports = router;