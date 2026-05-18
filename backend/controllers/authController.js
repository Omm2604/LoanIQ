const db = require("../config/db");

const bcrypt = require("bcryptjs");

const generateToken =
require("../utils/generateToken");

/* REGISTER */

exports.register = async(req,res)=>{

    try{

        const {
            full_name,
            email,
            password,
            role
        } = req.body;

        /* Validation */

        if(!full_name || !email || !password){

            return res.status(400).json({
                message:"All fields are required"
            });
        }

        /* Check Existing User */

        db.query(

            "SELECT * FROM users WHERE email=?",

            [email],

            async(err,results)=>{

                /* MYSQL ERROR */

                if(err){

                    console.log(
                        "MYSQL ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message:"Database Error"
                    });
                }

                /* SAFE CHECK */

                if(results && results.length > 0){

                    return res.status(400).json({
                        message:"Email already exists"
                    });
                }

                /* Hash Password */

                const hashedPassword =
                await bcrypt.hash(password,10);

                /* Insert User */

                db.query(

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
                    ],

                    (err,result)=>{

                        if(err){

                            console.log(
                                "INSERT ERROR:",
                                err
                            );

                            return res.status(500).json({
                                message:"Insert Failed"
                            });
                        }

                        res.status(201).json({

                            success:true,

                            message:
                            "User Registered Successfully"
                        });
                    }
                );
            }
        );

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });
    }
};

/* LOGIN */

exports.login = async(req,res)=>{

    try{

        const {
            email,
            password
        } = req.body;

        db.query(

            "SELECT * FROM users WHERE email=?",

            [email],

            async(err,results)=>{

                if(err){

                    console.log(err);

                    return res.status(500).json({
                        message:"Database Error"
                    });
                }

                if(!results || results.length === 0){

                    return res.status(400).json({
                        message:"User not found"
                    });
                }

                const user = results[0];

                const isMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

                if(!isMatch){

                    return res.status(400).json({
                        message:"Invalid credentials"
                    });
                }

                const token =
                generateToken(
                    user.user_id,
                    user.role
                );

                res.json({

                    success:true,

                    token,

                    role:user.role,

                    user:{

                        id:user.user_id,

                        full_name:user.full_name,

                        email:user.email,

                        role:user.role
                    }
                });
            }
        );

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });
    }
};