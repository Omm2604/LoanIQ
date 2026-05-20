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

        const {
            email,
            password
        } = req.body;

        const [results] = await db.query(

            "SELECT * FROM users WHERE email=?",

            [email]
        );

        if (!results || results.length === 0) {

            return res.status(400).json({
                message: "User not found"
            });
        }

        const user = results[0];

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token =
            generateToken(
                user.user_id,
                user.role
            );

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

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};