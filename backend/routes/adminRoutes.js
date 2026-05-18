const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const authorizeRoles =
require("../middleware/roleMiddleware");

const {

    getApplications,
    approveLoan,
    rejectLoan

}
=
require("../controllers/adminController");

/* ALL APPLICATIONS */

router.get(
    "/applications",
    protect,
    authorizeRoles("admin"),
    getApplications
);

/* APPROVE */

router.put(
    "/approve/:id",
    protect,
    authorizeRoles("admin"),
    approveLoan
);

/* REJECT */

router.put(
    "/reject/:id",
    protect,
    authorizeRoles("admin"),
    rejectLoan
);

module.exports = router;