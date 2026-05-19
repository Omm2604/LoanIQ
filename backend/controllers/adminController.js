const db = require("../config/db");

/* ALL APPLICATIONS */

exports.getApplications = (req,res)=>{

    db.query(

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

        ORDER BY a.applied_at DESC`,

        (err,results)=>{

            if(err){

                console.log(err);

                return res.status(500).json({

                    message:"Database Error"
                });
            }

            res.json(results);
        }
    );
};

/* APPROVE */

exports.approveLoan = (req,res)=>{

    const { id } = req.params;

    db.query(

        `UPDATE applications
         SET status='Approved'
         WHERE application_id=?`,

        [id],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.status(500).json({

                    message:"Approval Failed"
                });
            }

            res.json({

                success:true,

                message:"Loan Approved"
            });
        }
    );
};

exports.rejectLoan = (req,res)=>{

    const { id } = req.params;

    db.query(

        `UPDATE applications
         SET status='Rejected'
         WHERE application_id=?`,

        [id],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.status(500).json({

                    message:"Rejection Failed"
                });
            }

            res.json({

                success:true,

                message:"Loan Rejected"
            });
        }
    );
};