const express = require("express");

const {
    getReviewController,
    createReviewController
} = require("../controllers/reviewController");


const router =
    express.Router();


/*
    دریافت وضعیت Review سفارش
*/

router.get(
    "/:trackingCode",
    getReviewController
);


/*
    ثبت Review
*/

router.post(
    "/:trackingCode",
    createReviewController
);


module.exports = router;