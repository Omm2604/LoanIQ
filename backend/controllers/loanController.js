const db = require("../config/db");

const predictLoan =
require("../services/mlService");

/* APPLY LOAN */

exports.applyLoan = async(req,res)=>{

    try{

        const {

            Credit_Score,
            Monthly_Income,
            Coapplicant_Income,
            Loan_Amount,
            Loan_Term,
            Education,
            Self_Employed,
            Dependents,
            Property_Area,
            Collateral,
            Age,
            loan_type

        } = req.body;

        console.log(req.body);

        /* USER */

        const applicant_id =

        req.user.user_id ||

        req.user.id;

        /* VALIDATION */

        if(

            !Credit_Score ||

            !Monthly_Income ||

            !Loan_Amount ||

            !Loan_Term ||

            !loan_type

        ){

            return res.status(400).json({

                message:
                "All required fields are mandatory"
            });
        }

        /* ML PREDICTION */

        const prediction =
        await predictLoan({

            Credit_Score,

            Monthly_Income,

            Coapplicant_Income,

            Loan_Amount,

            Loan_Term,

            Education,

            Self_Employed,

            Dependents,

            Property_Area,

            Collateral,

            Age
        });

        console.log(
            "ML RESULT:",
            prediction
        );

        /* EMI CALCULATION */

        const monthlyRate =
        9.5 / 12 / 100;

        const emi =

        Loan_Amount *

        monthlyRate *

        Math.pow(
            1 + monthlyRate,
            Loan_Term
        ) /

        (

            Math.pow(
                1 + monthlyRate,
                Loan_Term
            ) - 1
        );

        /* RISK ANALYSIS */

        let risk = "Medium";

        if(prediction.risk_score <= 30){

            risk = "Low";

        }else if(
            prediction.risk_score >= 70
        ){

            risk = "High";
        }

        /* ML RECOMMENDATION */

        const mlRecommendation =

        prediction.approved

        ? "Approve"

        : "Reject";

        /* ELIGIBILITY SCORE */

        const eligibilityScore =

        Number(

            prediction.probability * 100

        ).toFixed(1);

        /* INSERT APPLICATION */

        await db.query(

            `INSERT INTO applications(

                applicant_id,
                employment_type,
                applicant_income,
                coapplicant_income,
                credit_score,
                loan_type,
                loan_amount,
                loan_term_months,
                property_area,
                collateral_type,
                estimated_emi,
                ml_eligibility_score,
                risk_verdict,
                ml_recommendation,
                status

            )

            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,

            [
                applicant_id,
                Self_Employed === "Yes" ? "Self-Employed" : "Salaried",
                Monthly_Income,
                Coapplicant_Income,
                Credit_Score,
                loan_type,
                Loan_Amount,
                Loan_Term,
                Property_Area,
                Collateral,
                emi,
                eligibilityScore,
                risk,
                mlRecommendation,
                "Pending"
            ]
        );

        /* CUSTOMER SAFE RESPONSE */

        res.status(201).json({

            success:true,

            message:
            "Loan Application Submitted",

            ml_result:{

                eligibility_score:
                eligibilityScore,

                confidence:
                prediction.confidence,

                interest_rate:
                prediction.interest_rate
            }
        });

    }

    catch(error){

        console.log(
            "LOAN ERROR:",
            error
        );

        res.status(500).json({

            message:
            "Server Error"
        });
    }
};

/* CUSTOMER APPLICATIONS */

exports.myApplications = async (req,res)=>{

    const applicant_id =

    req.user.user_id ||

    req.user.id;

    try {
        const [results] = await db.query(

            `SELECT

                application_id,
                loan_type,
                loan_amount,
                credit_score,
                ml_eligibility_score,
                status,
                applied_at

            FROM applications

            WHERE applicant_id=?

            ORDER BY applied_at DESC`,

            [applicant_id]
        );

        res.json(results);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Database Error"
        });
    }
};