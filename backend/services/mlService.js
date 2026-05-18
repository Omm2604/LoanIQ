const axios = require("axios");

const predictLoan = async(data)=>{

    try{

        const response =
        await axios.post(

            "http://127.0.0.1:8000/predict",

            data
        );

        return response.data;

    }catch(error){

        console.log(
            "ML SERVICE ERROR:",
            error.message
        );

        throw error;
    }
};

module.exports = predictLoan;