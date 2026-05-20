

/* Middleware */

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

app.use(cors({
    origin: "*",
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}));

app.options("*", cors());

app.use(express.json());

/* Request Debug */

app.use((req,res,next)=>{

    console.log(
        req.method,
        req.url
    );

    next();
});

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

/* Root */

app.get("/",(req,res)=>{

    res.send(
        "LoanIQ Backend Running"
    );
});

/* Start */

app.listen(

    process.env.PORT,

    "0.0.0.0",

    ()=>{

        console.log(
            `Server running on port ${process.env.PORT}`
        );
    }
);