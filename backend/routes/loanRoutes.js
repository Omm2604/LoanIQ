const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const {
    applyLoan,
    myApplications
}
=
require("../controllers/loanController");

router.post(
    "/apply",
    protect,
    applyLoan
);

router.get(
    "/my-applications",
    protect,
    myApplications
);

module.exports = router;