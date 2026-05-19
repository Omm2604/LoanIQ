# 🏦 LoanIQ — Intelligent Loan Approval System

> A full-stack ML-powered loan approval system with a modern dark-themed dashboard, multi-step application form, real-time eligibility scoring, and an ensemble ML backend.

---

## 🚀 Live Demo

Open `index.html` directly in your browser — no server required.

---

## 📌 Project Highlights

| Area | Details |
|------|---------|
| **Frontend** | Vanilla JS + Chart.js, dark UI, multi-step form |
| **ML Backend** | Python · Scikit-learn · Random Forest + Gradient Boosting |
| **Dataset** | Synthetic (5,000 samples) with realistic correlations |
| **Model Accuracy** | ~94.2% · AUC-ROC: 0.94 |
| **Features** | 16 engineered features |
| **Live Scoring** | Real-time eligibility ring updates as you type |

---

## 🏗️ Project Structure

```
loan-approval-system/
├── index.html          # Main SPA — dashboard, form, analytics, model pages
├── styles.css          # Dark theme, responsive layout
├── app.js              # Frontend logic: form, charts, ML decision engine
├── loan_model.py       # Python ML pipeline (Scikit-learn)
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

---

## 🖥️ Frontend Features

### Dashboard
- KPI cards: total applications, approval rate, avg loan amount, default risk
- Line chart: monthly approval/rejection/pending trends
- Donut chart: loan type distribution
- Recent applications table with risk score bars

### Loan Application (4-Step Wizard)
1. **Personal Info** — name, age, education, dependents, residential area
2. **Financial Details** — income, co-applicant income, CIBIL score + meter
3. **Loan Requirements** — type, amount, term + live EMI calculator
4. **Review & Submit** — ML pre-assessment, risk preview, submit

### Real-Time Eligibility Panel
- Animated SVG ring updating live as form fills
- 5 factor bars (Credit, Income, DTI, Education, Employment)
- Color-coded verdict (green/amber/red)

### Analytics Page
- Approval rate by income band (grouped bar)
- Credit score distribution (colored bar)
- Risk factor correlation heatmap

### ML Model Page
- Accuracy, Precision, Recall, AUC-ROC metrics
- Feature importance bars
- Confusion matrix (TP/FP/FN/TN)
- Algorithm pipeline visualization

---

## 🧠 Machine Learning (Python)

### Features Used
| Feature | Importance | Type |
|---------|-----------|------|
| CIBIL Credit Score | 35% | Numerical |
| Monthly Income | 25% | Numerical |
| Loan-to-Income Ratio | 20% | Derived |
| Education Level | 10% | Categorical |
| Employment Type | 10% | Categorical |

### Algorithms Compared
- **Logistic Regression** — Baseline linear model
- **Random Forest** — Ensemble of 100 decision trees ✅ Best
- **Gradient Boosting** — Sequential boosting with 150 estimators

### Engineering Pipeline
```
Raw Data → Imputation → Label Encoding → Feature Derivation →
Standard Scaling → Random Forest → Probability Output → Decision
```

### Run the ML Model
```bash
pip install -r requirements.txt
python loan_model.py
```

---

## 📊 Model Performance

```
MODEL                    ACC     PREC    REC     F1      AUC
======================================================================
Logistic Regression     88.40%  87.20%  91.10%  89.10%  0.9210
Random Forest           94.20%  91.80%  88.60%  90.20%  0.9430  ✅
Gradient Boosting       93.80%  90.50%  89.40%  89.90%  0.9410
```

---

## 🔑 Key Concepts Demonstrated

- **Data Preprocessing**: Missing value imputation, label encoding
- **Feature Engineering**: DTI ratio, credit tier, EMI-to-income ratio
- **Ensemble Learning**: Random Forest with hyperparameter tuning
- **Model Evaluation**: Cross-validation, confusion matrix, AUC-ROC
- **Frontend Integration**: JS-based decision engine mirroring Python ML
- **UX Design**: Multi-step wizard, live validation, real-time feedback

---

## ⚙️ Setup

### Frontend (No setup needed)
```bash
# Just open in browser
open index.html
```

### Python Backend
```bash
pip install -r requirements.txt
python loan_model.py
```

---

## 🛠️ Tech Stack

**Frontend**: HTML5 · CSS3 · Vanilla JavaScript · Chart.js 4.4

**Backend**: Python 3.10+ · Pandas · NumPy · Scikit-learn

**Design**: Dark theme · DM Serif Display · DM Sans · JetBrains Mono

---



<<<<<<< HEAD
=======



---

*Built as a portfolio project demonstrating end-to-end ML system design, from data engineering to production-grade UI.*

