const db = require("../config/db");

const bcrypt = require("bcryptjs");

const generateToken =
require("../utils/generateToken");

/* REGISTER */

exports.register = async (req, res) => {

    try {

        const {
            full_name,
            email,
            password,
            role
        } = req.body;

        /* Validation */

        if (!full_name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }

        /* Check Existing User */

        const [existingUsers] = await db.query(

            "SELECT * FROM users WHERE email=?",

            [email]
        );

        if (existingUsers.length > 0) {

            return res.status(400).json({
                message: "Email already exists"
            });
        }

        /* Hash Password */

        const hashedPassword =
            await bcrypt.hash(password, 10);

        /* Insert User */

        await db.query(

            `INSERT INTO users
            (
                full_name,
                email,
                password,
                role
            )

            VALUES(?,?,?,?)`,

            [
                full_name,
                email,
                hashedPassword,
                role || "customer"
            ]
        );

        res.status(201).json({

            success: true,

            message:
                "User Registered Successfully"
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

/* LOGIN */

exports.login = async (req, res) => {

    try {

        console.log("STEP 1 - Request received");

        const {
            email,
            password
        } = req.body;

        console.log("STEP 2 - Body parsed");

        const [results] = await db.query(

            "SELECT * FROM users WHERE email=?",

            [email]
        );

        console.log("STEP 3 - Query completed");

        if (!results || results.length === 0) {

            console.log("STEP 4 - User not found");

            return res.status(400).json({
                message: "User not found"
            });
        }

        const user = results[0];

        console.log("STEP 5 - User found");

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        console.log("STEP 6 - Password checked");

        if (!isMatch) {

            console.log("STEP 7 - Invalid password");

            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        console.log("STEP 8 - Generating token");

        const token =
            generateToken(
                user.user_id,
                user.role
            );

        console.log("STEP 9 - Token generated");

        res.json({

            success: true,

            token,

            role: user.role,

            user: {

                id: user.user_id,

                full_name: user.full_name,

                email: user.email,

                role: user.role
            }
        });

        console.log("STEP 10 - Response sent");

    }

    catch (error) {

        console.log("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};