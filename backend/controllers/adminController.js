const db = require("../config/db");

/* ALL APPLICATIONS */

exports.getApplications = async (req,res)=>{

    try {
        const [results] = await db.query(

            `SELECT

                a.application_id,
                a.loan_type,
                a.loan_amount,
                a.status,
                a.risk_verdict,
                a.ml_eligibility_score,
                a.ml_recommendation,
                a.applied_at,
                u.full_name


            FROM applications a

            JOIN users u

            ON a.applicant_id = u.user_id

            ORDER BY a.applied_at DESC`
        );

        res.json(results);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Database Error"
        });
    }
};

/* APPROVE */

exports.approveLoan = async (req,res)=>{

    const { id } = req.params;

    try {
        await db.query(

            `UPDATE applications
             SET status='Approved'
             WHERE application_id=?`,

            [id]
        );

        res.json({

            success:true,

            message:"Loan Approved"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Approval Failed"
        });
    }
};

exports.rejectLoan = async (req,res)=>{

    const { id } = req.params;

    try {
        await db.query(

            `UPDATE applications
             SET status='Rejected'
             WHERE application_id=?`,

            [id]
        );

        res.json({

            success:true,

            message:"Loan Rejected"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:"Rejection Failed"
        });
    }
};