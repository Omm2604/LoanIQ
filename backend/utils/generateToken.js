const jwt = require("jsonwebtoken");

const generateToken = (

    user_id,
    role

)=>{

    return jwt.sign(

        {

            user_id:user_id,

            role:role
        },

        process.env.JWT_SECRET,

        {

            expiresIn:"7d"
        }
    );
};

module.exports = generateToken;