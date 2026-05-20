const express = require("express");

const cors = require("cors");

require("dotenv").config();

const authRoutes =
require("./routes/authRoutes");

const loanRoutes =
require("./routes/loanRoutes");

const adminRoutes =
require("./routes/adminRoutes");

const app = express();

/* Middleware */

app.use(cors());

app.use(express.json());

/* Routes */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/loan",
    loanRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.options('*', cors());

app.listen(
    process.env.PORT,
    '0.0.0.0',
    () => {
        console.log(
            `Server running on port ${process.env.PORT}`
        );
    }
);