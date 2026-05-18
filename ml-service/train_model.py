from loan_model import LoanApprovalPredictor
import joblib

print("Training Loan Model...")

predictor = LoanApprovalPredictor()

predictor.train()

joblib.dump(
    predictor,
    "loan_model.pkl"
)

print("Model Saved Successfully")