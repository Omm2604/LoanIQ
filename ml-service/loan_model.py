"""
LoanIQ — Loan Approval System
ML Backend: loan_model.py

This module implements the machine learning pipeline for loan approval prediction.
Algorithms: Logistic Regression, Random Forest, Gradient Boosting (ensemble)
Dataset: Loan Prediction Dataset (Kaggle) — Extended with synthetic features
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report
)
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import warnings

warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────────────────────
#  Data Generation (Synthetic dataset for demonstration)
# ─────────────────────────────────────────────────────────────

def generate_synthetic_data(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic loan application data with realistic correlations.
    
    Features:
        - Credit_Score     : CIBIL score (300–900)
        - Monthly_Income   : Applicant income in ₹
        - Coapplicant_Income: Co-applicant income
        - Loan_Amount      : Requested loan in ₹
        - Loan_Term        : Term in months
        - Education        : Graduate / Not Graduate
        - Self_Employed    : Yes / No
        - Dependents       : 0, 1, 2, 3+
        - Property_Area    : Urban / Semiurban / Rural
        - Collateral       : None / Property / Vehicle / FD / Gold
        - Loan_Status      : Y (approved) / N (rejected)  ← target
    """
    rng = np.random.default_rng(seed)

    # Base features
    credit_score   = rng.integers(300, 900, n_samples)
    monthly_income = rng.integers(10000, 200000, n_samples)
    _has_coapplicant = rng.random(n_samples) > 0.6  # ~40% have co-applicant
    coapplicant = np.where(_has_coapplicant, rng.integers(5000, 80000, n_samples), 0)
    loan_amount    = rng.integers(50000, 5000000, n_samples)
    loan_term      = rng.choice([12, 24, 36, 60, 84, 120, 180, 360], n_samples)
    education      = rng.choice(['Graduate', 'Not Graduate', 'Post Graduate'], n_samples, p=[0.6, 0.25, 0.15])
    self_employed  = rng.choice(['No', 'Yes'], n_samples, p=[0.72, 0.28])
    dependents     = rng.choice(['0', '1', '2', '3+'], n_samples, p=[0.40, 0.25, 0.22, 0.13])
    property_area  = rng.choice(['Urban', 'Semiurban', 'Rural'], n_samples, p=[0.40, 0.35, 0.25])
    collateral     = rng.choice(['None', 'Property', 'Vehicle', 'FD', 'Gold'], n_samples, p=[0.40, 0.30, 0.12, 0.10, 0.08])
    age            = rng.integers(21, 65, n_samples)

    df = pd.DataFrame({
        'Credit_Score': credit_score,
        'Monthly_Income': monthly_income,
        'Coapplicant_Income': coapplicant,
        'Loan_Amount': loan_amount,
        'Loan_Term': loan_term,
        'Education': education,
        'Self_Employed': self_employed,
        'Dependents': dependents,
        'Property_Area': property_area,
        'Collateral': collateral,
        'Age': age,
    })

    # Derived features
    df['Total_Income'] = df['Monthly_Income'] + df['Coapplicant_Income']
    df['DTI_Ratio']    = df['Loan_Amount'] / (df['Total_Income'] * 12)  # Debt-to-Income

    # Approval logic (realistic scoring)
    score = np.zeros(n_samples)
    score += (df['Credit_Score'] - 300) / 600 * 35      # Credit weight: 35%
    score += np.clip(df['Total_Income'] / 150000, 0, 1) * 25  # Income weight: 25%
    score += np.clip(1 - df['DTI_Ratio'] / 15, 0, 1) * 20    # DTI weight: 20%
    score += (df['Education'] != 'Not Graduate').astype(int) * 10  # Education: 10%
    score += (df['Self_Employed'] == 'No').astype(int) * 5    # Stability: 5%
    score += (df['Collateral'] != 'None').astype(int) * 5     # Collateral: 5%

    # Add noise for realism
    noise = rng.normal(0, 5, n_samples)
    score = np.clip(score + noise, 0, 100)

    df['Loan_Status'] = (score >= 52).astype(int)  # 1 = Approved, 0 = Rejected
    df['Risk_Score']  = 100 - score.round().astype(int)

    return df


# ─────────────────────────────────────────────────────────────
#  Feature Engineering
# ─────────────────────────────────────────────────────────────

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create derived features to improve model performance."""
    df = df.copy()

    # Encode categoricals
    encodings = {
        'Education':     {'Graduate': 1, 'Not Graduate': 0, 'Post Graduate': 2},
        'Self_Employed': {'No': 0, 'Yes': 1},
        'Dependents':    {'0': 0, '1': 1, '2': 2, '3+': 3},
        'Property_Area': {'Rural': 0, 'Semiurban': 1, 'Urban': 2},
        'Collateral':    {'None': 0, 'Vehicle': 1, 'Gold': 2, 'FD': 3, 'Property': 4},
    }
    for col, mapping in encodings.items():
        if col in df.columns:
            df[col] = df[col].map(mapping)

    # Credit tier (0=poor, 1=fair, 2=good, 3=great, 4=excellent)
    df['Credit_Tier'] = pd.cut(
        df['Credit_Score'],
        bins=[0, 580, 670, 740, 800, 901],
        labels=[0, 1, 2, 3, 4]
    ).astype(float)

    # Income sufficiency ratio
    df['Income_Ratio'] = df['Total_Income'] / df['Loan_Amount'].replace(0, 1)

    # Loan affordability: monthly payment vs income
    r = 9.5 / 12 / 100
    df['Est_EMI'] = (df['Loan_Amount'] * r * (1 + r) ** df['Loan_Term']) / ((1 + r) ** df['Loan_Term'] - 1)
    df['EMI_to_Income'] = df['Est_EMI'] / df['Monthly_Income'].replace(0, 1)

    return df


# ─────────────────────────────────────────────────────────────
#  Model Pipeline
# ─────────────────────────────────────────────────────────────

FEATURE_COLUMNS = [
    'Credit_Score', 'Credit_Tier', 'Monthly_Income', 'Coapplicant_Income',
    'Total_Income', 'Loan_Amount', 'Loan_Term', 'DTI_Ratio', 'Income_Ratio',
    'EMI_to_Income', 'Education', 'Self_Employed', 'Dependents',
    'Property_Area', 'Collateral', 'Age'
]

def build_models() -> dict:
    """Return a dict of model pipelines for comparison."""
    return {
        'Logistic Regression': Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler',  StandardScaler()),
            ('clf',     LogisticRegression(C=1.0, max_iter=1000, random_state=42))
        ]),
        'Random Forest': Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('clf',     RandomForestClassifier(
                n_estimators=100, max_depth=12, min_samples_leaf=5,
                class_weight='balanced', random_state=42, n_jobs=-1
            ))
        ]),
        'Gradient Boosting': Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler',  StandardScaler()),
            ('clf',     GradientBoostingClassifier(
                n_estimators=150, learning_rate=0.08, max_depth=5,
                subsample=0.8, random_state=42
            ))
        ]),
    }


# ─────────────────────────────────────────────────────────────
#  Training & Evaluation
# ─────────────────────────────────────────────────────────────

def evaluate_model(model, X_test, y_test, name: str) -> dict:
    """Compute full evaluation metrics."""
    y_pred  = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        'model':     name,
        'accuracy':  round(accuracy_score(y_test, y_pred) * 100, 2),
        'precision': round(precision_score(y_test, y_pred) * 100, 2),
        'recall':    round(recall_score(y_test, y_pred) * 100, 2),
        'f1':        round(f1_score(y_test, y_pred) * 100, 2),
        'auc_roc':   round(roc_auc_score(y_test, y_proba), 4),
        'confusion': confusion_matrix(y_test, y_pred).tolist(),
    }
    return metrics


def print_results(results: list[dict]):
    """Pretty print model comparison table."""
    print("\n" + "=" * 70)
    print(f"{'MODEL':<25} {'ACC':>7} {'PREC':>7} {'REC':>7} {'F1':>7} {'AUC':>7}")
    print("=" * 70)
    for r in results:
        print(f"{r['model']:<25} {r['accuracy']:>6.2f}% {r['precision']:>6.2f}% "
              f"{r['recall']:>6.2f}% {r['f1']:>6.2f}% {r['auc_roc']:>7.4f}")
    print("=" * 70)


# ─────────────────────────────────────────────────────────────
#  Prediction API
# ─────────────────────────────────────────────────────────────

class LoanApprovalPredictor:
    """
    Trained loan approval predictor.
    
    Usage:
        predictor = LoanApprovalPredictor()
        predictor.train()
        result = predictor.predict({...})
    """

    def __init__(self):
        self.model       = None
        self.scaler      = None
        self.is_trained  = False
        self.best_model  = 'Random Forest'

    def train(self, n_samples: int = 5000) -> dict:
        """Generate data, train models, select best."""
        print("🏦 LoanIQ — Training Loan Approval Models")
        print("─" * 45)

        # Generate + engineer data
        raw_df = generate_synthetic_data(n_samples)
        df     = engineer_features(raw_df)

        X = df[FEATURE_COLUMNS]
        y = df['Loan_Status']

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"Dataset: {len(df):,} samples | Train: {len(X_train):,} | Test: {len(X_test):,}")
        print(f"Class balance: {y.mean():.1%} approved\n")

        # Train all models
        models  = build_models()
        results = []

        for name, pipeline in models.items():
            print(f"Training {name}...", end=' ')
            pipeline.fit(X_train, y_train)
            metrics = evaluate_model(pipeline, X_test, y_test, name)
            results.append(metrics)
            print(f"✓  AUC={metrics['auc_roc']:.4f}  ACC={metrics['accuracy']:.2f}%")

        print_results(results)

        # Select best by AUC-ROC
        best = max(results, key=lambda r: r['auc_roc'])
        self.model = models[best['model']]
        self.best_model = best['model']
        self.feature_importances_ = self._get_feature_importance(self.model)
        self.is_trained = True

        print(f"\n✅ Best model: {best['model']}  (AUC={best['auc_roc']})")
        return best

    def predict(self, application: dict) -> dict:
        """
        Predict approval for a single application.
        
        Args:
            application: dict with keys matching feature schema
        
        Returns:
            dict with approved, probability, risk_score, interest_rate, reason_codes
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call .train() first.")

        df = pd.DataFrame([application])
        df['Total_Income']    = df.get('Monthly_Income', 0) + df.get('Coapplicant_Income', 0)
        df['DTI_Ratio']       = df['Loan_Amount'] / (df['Total_Income'] * 12).replace(0, 1)
        df = engineer_features(df)

        # Fill missing columns with defaults
        for col in FEATURE_COLUMNS:
            if col not in df.columns:
                df[col] = 0

        X        = df[FEATURE_COLUMNS]
        proba    = self.model.predict_proba(X)[0][1]
        approved = proba >= 0.50

        # Dynamic interest rate based on credit score
        credit = application.get('Credit_Score', 650)
        if credit >= 800:   rate = 7.5
        elif credit >= 750: rate = 8.0
        elif credit >= 700: rate = 8.75
        elif credit >= 650: rate = 9.5
        else:               rate = 11.5

        risk_score = round((1 - proba) * 100)

        # Reason codes
        reasons = self._reason_codes(application, df)

        return {

    'approved':
    bool(approved),

    'probability':
    float(round(float(proba), 4)),

    'confidence':
    int(round(abs(float(proba) - 0.5) * 200)),

    'risk_score':
    int(risk_score),

    'interest_rate':
    float(rate),

    'reason_codes': [

        str(reason)

        for reason in reasons
    ],
}

    def _get_feature_importance(self, model) -> dict:
        """Extract feature importances if available."""
        try:
            clf = model.named_steps['clf']
            if hasattr(clf, 'feature_importances_'):
                return dict(zip(FEATURE_COLUMNS, clf.feature_importances_.round(4)))
        except Exception:
            pass
        return {}

    def _reason_codes(self, app: dict, df: pd.DataFrame) -> list[str]:
        """Generate human-readable reason codes."""
        codes = []
        credit = app.get('Credit_Score', 0)
        income = app.get('Monthly_Income', 0)
        dti    = float(df['DTI_Ratio'].iloc[0]) if 'DTI_Ratio' in df.columns else 0

        if credit < 580:   codes.append("⚠ Credit score below minimum threshold (580)")
        elif credit >= 750: codes.append("✓ Excellent credit score")

        if income < 20000:  codes.append("⚠ Low monthly income")
        elif income >= 80000: codes.append("✓ Strong income profile")

        if dti > 8:         codes.append("⚠ High debt-to-income ratio")
        elif dti < 3:       codes.append("✓ Healthy debt-to-income ratio")

        if app.get('Self_Employed') == 'Yes':
            codes.append("~ Self-employment increases risk assessment")

        if app.get('Collateral', 'None') != 'None':
            codes.append("✓ Collateral provided — reduces lender risk")

        return codes


# ─────────────────────────────────────────────────────────────
#  Main Entry Point
# ─────────────────────────────────────────────────────────────

if __name__ == '__main__':
    predictor = LoanApprovalPredictor()
    best_metrics = predictor.train()

    # Example prediction
    sample = {
        'Credit_Score':       740,
        'Monthly_Income':     65000,
        'Coapplicant_Income': 20000,
        'Loan_Amount':        800000,
        'Loan_Term':          60,
        'Education':          'Graduate',
        'Self_Employed':      'No',
        'Dependents':         '1',
        'Property_Area':      'Urban',
        'Collateral':         'Property',
        'Age':                34,
    }

    print("\n" + "─" * 45)
    print("📋 Sample Prediction")
    print("─" * 45)
    result = predictor.predict(sample)
    print(f"  Applicant Income : ₹{sample['Monthly_Income']:,.0f}/mo")
    print(f"  Credit Score     : {sample['Credit_Score']}")
    print(f"  Loan Amount      : ₹{sample['Loan_Amount']:,.0f}")
    print(f"  Decision         : {'✅ APPROVED' if result['approved'] else '❌ REJECTED'}")
    print(f"  Probability      : {result['probability']:.2%}")
    print(f"  Risk Score       : {result['risk_score']}/100")
    print(f"  Interest Rate    : {result['interest_rate']}% p.a.")
    print(f"\n  Reason Codes:")
    for code in result['reason_codes']:
        print(f"    {code}")

    if predictor.feature_importances_:
        print("\n  Feature Importances (Top 5):")
        top5 = sorted(predictor.feature_importances_.items(), key=lambda x: -x[1])[:5]
        for feat, imp in top5:
            bar = '█' * int(imp * 40)
            print(f"    {feat:<22} {bar} {imp:.4f}")
