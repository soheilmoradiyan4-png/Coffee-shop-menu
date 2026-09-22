const express = require("express");

const {
    createOrderController
} = require("../controllers/orderController");


const router =
    express.Router();


router.post(
    "/",
    createOrderController
);


module.exports = router;