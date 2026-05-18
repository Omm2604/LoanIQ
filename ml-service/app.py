from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

predictor = joblib.load("loan_model.pkl")

# Request Schema

class LoanApplication(BaseModel):

    Credit_Score: int

    Monthly_Income: float

    Coapplicant_Income: float = 0

    Loan_Amount: float

    Loan_Term: int

    Education: str

    Self_Employed: str

    Dependents: str

    Property_Area: str

    Collateral: str

    Age: int

# Root

@app.get("/")

def root():

    return {
        "message":"LoanIQ ML API Running"
    }

# Prediction Endpoint

@app.post("/predict")

def predict(data: LoanApplication):

    result = predictor.predict(
        data.dict()
    )

    return result