// ============================================================
//  LoanIQ — Loan Approval System
//  Core Application Logic
// ============================================================

// ── Sample Data ──────────────────────────────────────────────
const SAMPLE_APPLICATIONS = [
  { id: 'LN-2024-001', name: 'Priya Sharma', type: 'Home', amount: 850000, income: 75000, credit: 780, status: 'approved', date: '2026-05-15', risk: 18 },
  { id: 'LN-2024-002', name: 'Rahul Mehta', type: 'Personal', amount: 200000, income: 42000, credit: 620, status: 'approved', date: '2026-05-14', risk: 34 },
  { id: 'LN-2024-003', name: 'Sunita Patel', type: 'Education', amount: 500000, income: 55000, credit: 700, status: 'pending', date: '2026-05-14', risk: 28 },
  { id: 'LN-2024-004', name: 'Amit Kumar', type: 'Vehicle', amount: 350000, income: 38000, credit: 560, status: 'rejected', date: '2026-05-13', risk: 72 },
  { id: 'LN-2024-005', name: 'Neha Singh', type: 'Business', amount: 1200000, income: 90000, credit: 760, status: 'approved', date: '2026-05-12', risk: 22 },
  { id: 'LN-2024-006', name: 'Vikram Reddy', type: 'Home', amount: 650000, income: 60000, credit: 640, status: 'pending', date: '2026-05-12', risk: 41 },
  { id: 'LN-2024-007', name: 'Deepa Nair', type: 'Personal', amount: 150000, income: 35000, credit: 510, status: 'rejected', date: '2026-05-11', risk: 81 },
  { id: 'LN-2024-008', name: 'Rohan Joshi', type: 'Education', amount: 700000, income: 68000, credit: 790, status: 'approved', date: '2026-05-10', risk: 15 },
];

let allApplications = [...SAMPLE_APPLICATIONS];
let currentStep = 1;
let chartsInitialized = false;

// ── Navigation ────────────────────────────────────────────────
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

  if (page === 'dashboard' && !chartsInitialized) {
    setTimeout(initDashboardCharts, 50);
    chartsInitialized = true;
    renderRecentTable();
  }
  if (page === 'applications') renderFullTable();
  if (page === 'analytics') initAnalyticsCharts();
  if (page === 'model') renderModelPage();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// ── Dashboard Charts ─────────────────────────────────────────
function initDashboardCharts() {
  // Trend Chart
  const ctx1 = document.getElementById('trendChart').getContext('2d');
  new Chart(ctx1, {
    type: 'line',
    data: {
      labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Approved',
          data: [142, 165, 158, 180, 192, 207],
          borderColor: '#10d9a0',
          backgroundColor: 'rgba(16,217,160,0.07)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10d9a0',
        },
        {
          label: 'Rejected',
          data: [58, 72, 65, 80, 78, 89],
          borderColor: '#f05a5a',
          backgroundColor: 'rgba(240,90,90,0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#f05a5a',
        },
        {
          label: 'Pending',
          data: [24, 30, 22, 35, 28, 32],
          borderColor: '#f0a850',
          backgroundColor: 'rgba(240,168,80,0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#f0a850',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#55556a' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#55556a' } }
      }
    }
  });

  // Loan Type Doughnut
  const ctx2 = document.getElementById('loanTypeChart').getContext('2d');
  new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Home', 'Personal', 'Education', 'Vehicle', 'Business'],
      datasets: [{
        data: [38, 24, 18, 12, 8],
        backgroundColor: ['#7c6fee', '#10d9a0', '#f0a850', '#5ac8f0', '#f05a5a'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { color: '#8888a0', font: { size: 11 }, padding: 14 } } }
    }
  });
}

// ── Table Rendering ───────────────────────────────────────────
function buildTableHTML(apps) {
  if (apps.length === 0) return '<div style="padding:32px;text-align:center;color:#55556a;font-size:14px;">No applications found</div>';
  return `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Applicant</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Credit</th>
          <th>Risk</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${apps.map(a => `
          <tr>
            <td class="td-id">${a.id}</td>
            <td class="td-name">${a.name}</td>
            <td>${a.type}</td>
            <td>₹${(a.amount/100000).toFixed(1)}L</td>
            <td>${a.credit}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="flex:1;height:4px;background:#1c1c26;border-radius:4px;overflow:hidden;">
                  <div style="height:100%;width:${a.risk}%;background:${a.risk < 30 ? '#10d9a0' : a.risk < 60 ? '#f0a850' : '#f05a5a'};border-radius:4px;"></div>
                </div>
                <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:#55556a;">${a.risk}%</span>
              </div>
            </td>
            <td><span class="status-badge status-${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
            <td>${a.date}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderRecentTable() {
  document.getElementById('recentTable').innerHTML = buildTableHTML(allApplications.slice(0, 5));
}

function renderFullTable() {
  document.getElementById('fullApplicationsTable').innerHTML = buildTableHTML(allApplications);
}

let statusFilter = 'all';
function filterApplications(q) {
  const filtered = allApplications.filter(a => {
    const matchQ = a.name.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase());
    const matchS = statusFilter === 'all' || a.status === statusFilter;
    return matchQ && matchS;
  });
  document.getElementById('fullApplicationsTable').innerHTML = buildTableHTML(filtered);
}

function filterByStatus(s) {
  statusFilter = s;
  filterApplications(document.getElementById('searchInput')?.value || '');
}

// ── Multi-Step Form ───────────────────────────────────────────
function nextStep(to) {
  if (!validateStep(currentStep)) return;
  goToStep(to);
  if (to === 4) buildReview();
}

function prevStep(to) { goToStep(to); }

function goToStep(to) {
  document.getElementById('step-' + currentStep).classList.remove('active');
  document.querySelectorAll('.step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n < to) s.classList.add('done');
    if (n === to) s.classList.add('active');
  });
  currentStep = to;
  document.getElementById('step-' + currentStep).classList.add('active');
  updateLiveScore();
}

function validateStep(step) {
  let valid = true;
  if (step === 1) {
    const name = document.getElementById('fullName').value.trim();
    const age = parseInt(document.getElementById('age').value);
    if (!name) { showErr('fullName', 'Name is required'); valid = false; }
    else clearErr('fullName');
    if (!age || age < 18 || age > 75) { showErr('age', 'Age must be 18–75'); valid = false; }
    else clearErr('age');
  }
  if (step === 2) {
    const income = parseInt(document.getElementById('applicantIncome').value);
    const credit = parseInt(document.getElementById('creditScore').value);
    if (!income || income < 5000) { showErr('income', 'Enter valid monthly income'); valid = false; }
    else clearErr('income');
    if (!credit || credit < 300 || credit > 900) { showErr('credit', 'CIBIL score: 300–900'); valid = false; }
    else clearErr('credit');
  }
  if (step === 3) {
    const amt = parseInt(document.getElementById('loanAmount').value);
    if (!amt || amt < 10000) { showErr('loan', 'Minimum loan amount ₹10,000'); valid = false; }
    else clearErr('loan');
  }
  return valid;
}

function showErr(id, msg) { document.getElementById('err-' + id).textContent = msg; }
function clearErr(id) { document.getElementById('err-' + id).textContent = ''; }

// ── Credit Score Meter ────────────────────────────────────────
document.getElementById('creditScore')?.addEventListener('input', function () {
  const score = parseInt(this.value);
  if (!score || score < 300 || score > 900) return;
  const pct = ((score - 300) / 600) * 100;
  document.getElementById('meterFill').style.width = pct + '%';
  document.getElementById('meterFill').style.backgroundPosition = (100 - pct) + '% 0';

  let label = '', color = '';
  if (score < 580) { label = '⚠ Poor — High Risk'; color = '#f05a5a'; }
  else if (score < 670) { label = '~ Fair — Moderate Risk'; color = '#f0a850'; }
  else if (score < 740) { label = '✓ Good — Low Risk'; color = '#5ac8f0'; }
  else if (score < 800) { label = '✓✓ Very Good'; color = '#10d9a0'; }
  else { label = '★ Excellent — Best Rates'; color = '#10d9a0'; }

  const cat = document.getElementById('scoreCategory');
  cat.textContent = label;
  cat.style.color = color;
  updateLiveScore();
});

// ── EMI Calculator ────────────────────────────────────────────
['loanAmount', 'loanTerm'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', calcEMI);
});

function calcEMI() {
  const principal = parseFloat(document.getElementById('loanAmount').value) || 0;
  const months = parseInt(document.getElementById('loanTerm').value) || 60;
  const rate = 9.5 / 12 / 100;
  if (principal <= 0) { document.getElementById('emiVal').textContent = '—'; return; }
  const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  document.getElementById('emiVal').textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
}

// ── Live Eligibility Score ────────────────────────────────────
function updateLiveScore() {
  const credit = parseInt(document.getElementById('creditScore').value) || 0;
  const income = parseInt(document.getElementById('applicantIncome').value) || 0;
  const loanAmt = parseInt(document.getElementById('loanAmount').value) || 0;
  const coIncome = parseInt(document.getElementById('coapplicantIncome').value) || 0;
  const edu = document.getElementById('education').value;
  const selfEmp = document.getElementById('selfEmployed').value;

  if (!credit && !income) return;

  const factors = computeFactors(credit, income, loanAmt, coIncome, edu, selfEmp);
  const totalScore = Math.round(Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length);

  // Update arc
  const circumference = 314;
  const offset = circumference - (circumference * totalScore / 100);
  const arc = document.getElementById('eligibilityArc');
  arc.setAttribute('stroke-dashoffset', offset);

  const color = totalScore >= 70 ? '#10d9a0' : totalScore >= 45 ? '#f0a850' : '#f05a5a';
  arc.setAttribute('stroke', color);

  document.getElementById('ringScore').textContent = totalScore;

  let verdict = '';
  if (totalScore >= 75) verdict = '✓ Strong eligibility — likely to be approved';
  else if (totalScore >= 55) verdict = '~ Moderate eligibility — may require review';
  else if (totalScore >= 35) verdict = '⚠ Below average — improvement needed';
  else verdict = '✗ High risk — consider improving credit score';

  document.getElementById('eligibilityVerdict').textContent = verdict;
  document.getElementById('eligibilityVerdict').style.color = color;

  // Factor bars
  const factorConfig = [
    { name: 'Credit Score', key: 'credit' },
    { name: 'Income', key: 'income' },
    { name: 'Loan Ratio', key: 'ratio' },
    { name: 'Education', key: 'edu' },
    { name: 'Employment', key: 'emp' },
  ];

  const list = document.getElementById('factorList');
  list.innerHTML = factorConfig.map(f => {
    const val = factors[f.key] || 0;
    const barColor = val >= 70 ? '#10d9a0' : val >= 45 ? '#f0a850' : '#f05a5a';
    return `
      <div class="factor-item">
        <span class="factor-name">${f.name}</span>
        <div class="factor-bar-wrap">
          <div class="factor-bar" style="width:${val}%;background:${barColor};"></div>
        </div>
        <span class="factor-score">${val}</span>
      </div>
    `;
  }).join('');
}

function computeFactors(credit, income, loanAmt, coIncome, edu, selfEmp) {
  const creditScore = credit ? Math.min(100, Math.max(0, Math.round(((credit - 300) / 600) * 100))) : 0;

  const totalIncome = income + coIncome;
  const incomeScore = !totalIncome ? 0 :
    totalIncome >= 100000 ? 95 :
    totalIncome >= 60000 ? 80 :
    totalIncome >= 35000 ? 60 :
    totalIncome >= 20000 ? 40 : 20;

  const dti = loanAmt && income ? (loanAmt / (income * 12)) : 0;
  const ratioScore = !loanAmt ? 50 :
    dti < 3 ? 90 : dti < 5 ? 70 : dti < 8 ? 50 : dti < 12 ? 30 : 10;

  const eduScore = edu === 'Post Graduate' ? 90 : edu === 'Graduate' ? 70 : edu === 'Not Graduate' ? 45 : 50;

  const empScore = selfEmp === 'Yes' ? 55 : 75;

  return { credit: creditScore, income: incomeScore, ratio: ratioScore, edu: eduScore, emp: empScore };
}

// ── ML Decision Engine ────────────────────────────────────────
function runMLModel(data) {
  const factors = computeFactors(data.credit, data.income, data.loanAmt, data.coIncome, data.edu, data.selfEmp);
  const score = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;

  // Feature weights (simulating Random Forest)
  const weighted =
    factors.credit * 0.35 +
    factors.income * 0.25 +
    factors.ratio * 0.20 +
    factors.edu * 0.10 +
    factors.emp * 0.10;

  const riskScore = Math.round(100 - weighted);
  const approved = weighted >= 55;
  const confidence = Math.min(98, Math.max(51, Math.round(Math.abs(weighted - 55) * 3 + 60)));

  let interestRate = 9.5;
  if (data.credit >= 800) interestRate = 7.5;
  else if (data.credit >= 750) interestRate = 8.0;
  else if (data.credit >= 700) interestRate = 8.75;
  else if (data.credit >= 650) interestRate = 9.5;
  else interestRate = 11.5;

  return { approved, score: Math.round(weighted), riskScore, confidence, interestRate };
}

// ── Build Review Page ─────────────────────────────────────────
function buildReview() {
  const data = gatherFormData();
  const result = runMLModel(data);

  document.getElementById('reviewGrid').innerHTML = `
    <div class="review-section">
      <h4>Personal</h4>
      <div class="review-row"><span>Name</span><span>${data.name || '—'}</span></div>
      <div class="review-row"><span>Age</span><span>${data.age || '—'}</span></div>
      <div class="review-row"><span>Education</span><span>${data.edu || '—'}</span></div>
      <div class="review-row"><span>Dependents</span><span>${data.dependents}</span></div>
    </div>
    <div class="review-section">
      <h4>Financial</h4>
      <div class="review-row"><span>Monthly Income</span><span>₹${parseInt(data.income||0).toLocaleString('en-IN')}</span></div>
      <div class="review-row"><span>Co-applicant</span><span>₹${parseInt(data.coIncome||0).toLocaleString('en-IN')}</span></div>
      <div class="review-row"><span>CIBIL Score</span><span>${data.credit}</span></div>
      <div class="review-row"><span>Employment</span><span>${data.selfEmp === 'Yes' ? 'Self-Employed' : 'Salaried'}</span></div>
    </div>
    <div class="review-section">
      <h4>Loan</h4>
      <div class="review-row"><span>Type</span><span>${data.loanType}</span></div>
      <div class="review-row"><span>Amount</span><span>₹${parseInt(data.loanAmt||0).toLocaleString('en-IN')}</span></div>
      <div class="review-row"><span>Term</span><span>${data.term} months</span></div>
      <div class="review-row"><span>Collateral</span><span>${data.collateral}</span></div>
    </div>
    <div class="review-section">
      <h4>ML Pre-Assessment</h4>
      <div class="review-row"><span>Eligibility Score</span><span style="color:${result.score >= 60 ? '#10d9a0' : '#f05a5a'}">${result.score}/100</span></div>
      <div class="review-row"><span>Risk Score</span><span>${result.riskScore}%</span></div>
      <div class="review-row"><span>Est. Interest Rate</span><span>${result.interestRate}% p.a.</span></div>
      <div class="review-row"><span>Confidence</span><span>${result.confidence}%</span></div>
    </div>
  `;

  const predColor = result.approved ? '#10d9a0' : '#f05a5a';
  document.getElementById('riskPreview').innerHTML = `
    <div style="width:40px;height:40px;border-radius:50%;background:${predColor}22;border:2px solid ${predColor};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">
      ${result.approved ? '✓' : '✗'}
    </div>
    <div>
      <div style="font-size:14px;font-weight:500;color:${predColor};margin-bottom:3px;">
        ML Prediction: ${result.approved ? 'Likely Approved' : 'Likely Rejected'}
      </div>
      <div style="font-size:12px;color:#8888a0;">Model confidence: ${result.confidence}% — Final decision subject to manual review</div>
    </div>
  `;
}

// ── Submit Application ────────────────────────────────────────
function submitApplication() {
  const btn = document.querySelector('.submit-btn');
  btn.querySelector('.btn-text').style.display = 'none';
  btn.querySelector('.btn-loader').style.display = 'inline';
  btn.disabled = true;

  setTimeout(() => {
    const data = gatherFormData();
    const result = runMLModel(data);

    // Add to applications list
    const newApp = {
      id: 'LN-2026-' + String(allApplications.length + 1).padStart(3, '0'),
      name: data.name,
      type: data.loanType,
      amount: data.loanAmt,
      income: data.income,
      credit: data.credit,
      status: result.approved ? 'approved' : 'rejected',
      date: new Date().toISOString().split('T')[0],
      risk: result.riskScore
    };
    allApplications.unshift(newApp);

    // Show modal
    const modal = document.getElementById('resultModal');
    document.getElementById('modalIcon').textContent = result.approved ? '🎉' : '⚠️';
    document.getElementById('modalTitle').textContent = result.approved ? 'Application Approved!' : 'Application Declined';
    document.getElementById('modalTitle').style.color = result.approved ? '#10d9a0' : '#f05a5a';
    document.getElementById('modalMessage').textContent = result.approved
      ? `Congratulations ${data.name}! Your loan application has been approved based on strong creditworthiness.`
      : `We regret to inform you that your application did not meet our current lending criteria. You may reapply after improving your credit score.`;

    const emi = calcEMIValue(data.loanAmt, data.term, result.interestRate);
    document.getElementById('modalDetails').innerHTML = `
      <div class="review-row"><span>Application ID</span><span style="font-family:monospace">${newApp.id}</span></div>
      <div class="review-row"><span>Loan Amount</span><span>₹${parseInt(data.loanAmt).toLocaleString('en-IN')}</span></div>
      <div class="review-row"><span>Interest Rate</span><span>${result.interestRate}% p.a.</span></div>
      <div class="review-row"><span>Monthly EMI</span><span>₹${emi.toLocaleString('en-IN')}</span></div>
      <div class="review-row"><span>Eligibility Score</span><span>${result.score}/100</span></div>
    `;

    modal.style.display = 'flex';

    btn.querySelector('.btn-text').style.display = 'inline';
    btn.querySelector('.btn-loader').style.display = 'none';
    btn.disabled = false;
  }, 2200);
}

function calcEMIValue(principal, months, annualRate) {
  const r = annualRate / 12 / 100;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

function closeModal() {
  document.getElementById('resultModal').style.display = 'none';
}

function gatherFormData() {
  return {
    name: document.getElementById('fullName').value,
    age: document.getElementById('age').value,
    edu: document.getElementById('education').value,
    dependents: document.getElementById('dependents').value,
    income: parseInt(document.getElementById('applicantIncome').value) || 0,
    coIncome: parseInt(document.getElementById('coapplicantIncome').value) || 0,
    credit: parseInt(document.getElementById('creditScore').value) || 0,
    selfEmp: document.getElementById('selfEmployed').value,
    loanType: document.getElementById('loanType').value,
    loanAmt: parseInt(document.getElementById('loanAmount').value) || 0,
    term: parseInt(document.getElementById('loanTerm').value),
    collateral: document.getElementById('collateral').value,
  };
}

// ── Analytics Charts ─────────────────────────────────────────
let analyticsInited = false;
function initAnalyticsCharts() {
  if (analyticsInited) return;
  analyticsInited = true;

  // Income Band Chart
  const ctx1 = document.getElementById('incomeChart').getContext('2d');
  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['<20K', '20-40K', '40-60K', '60-100K', '100K+'],
      datasets: [{
        label: 'Approved',
        data: [12, 45, 78, 92, 98],
        backgroundColor: 'rgba(16,217,160,0.7)',
        borderRadius: 4,
      }, {
        label: 'Rejected',
        data: [88, 55, 22, 8, 2],
        backgroundColor: 'rgba(240,90,90,0.6)',
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8888a0', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55556a' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55556a', callback: v => v + '%' } }
      }
    }
  });

  // Credit Distribution
  const ctx2 = document.getElementById('creditChart').getContext('2d');
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['300-499', '500-579', '580-669', '670-739', '740-799', '800+'],
      datasets: [{
        label: 'Applicants',
        data: [42, 89, 214, 385, 298, 156],
        backgroundColor: [
          'rgba(240,90,90,0.7)',
          'rgba(240,90,90,0.5)',
          'rgba(240,168,80,0.6)',
          'rgba(90,200,240,0.6)',
          'rgba(16,217,160,0.6)',
          'rgba(16,217,160,0.9)',
        ],
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55556a', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55556a' } }
      }
    }
  });

  // Heatmap
  renderHeatmap();
}

function renderHeatmap() {
  const features = ['Credit', 'Income', 'DTI', 'Employ.', 'Edu.', 'Collat.'];
  const data = [
    [1.00, 0.42, -0.38, 0.21, 0.31, 0.18],
    [0.42, 1.00, -0.52, 0.45, 0.24, 0.12],
    [-0.38, -0.52, 1.00, -0.28, -0.15, -0.44],
    [0.21, 0.45, -0.28, 1.00, 0.18, 0.09],
    [0.31, 0.24, -0.15, 0.18, 1.00, 0.07],
    [0.18, 0.12, -0.44, 0.09, 0.07, 1.00],
  ];

  const container = document.getElementById('heatmap');
  container.style.gridTemplateColumns = `80px repeat(${features.length}, 1fr)`;

  let html = '<div></div>';
  features.forEach(f => { html += `<div class="hm-label" style="text-align:center;font-size:10px;color:#55556a;padding:4px 0;">${f}</div>`; });

  data.forEach((row, i) => {
    html += `<div class="hm-label" style="font-size:10px;color:#55556a;padding:8px 4px;">${features[i]}</div>`;
    row.forEach(val => {
      const abs = Math.abs(val);
      const color = val > 0
        ? `rgba(16,217,160,${abs.toFixed(2)})`
        : val < 0
          ? `rgba(240,90,90,${abs.toFixed(2)})`
          : 'rgba(255,255,255,0.05)';
      html += `<div class="hm-cell" style="background:${color}" title="${val.toFixed(2)}">${val.toFixed(2)}</div>`;
    });
  });

  container.innerHTML = html;
}

// ── Model Page ────────────────────────────────────────────────
function renderModelPage() {
  const features = [
    { name: 'CIBIL Credit Score', pct: 35, color: '#7c6fee' },
    { name: 'Monthly Income', pct: 25, color: '#10d9a0' },
    { name: 'Loan-to-Income Ratio', pct: 20, color: '#5ac8f0' },
    { name: 'Education Level', pct: 10, color: '#f0a850' },
    { name: 'Employment Type', pct: 10, color: '#f05a5a' },
  ];

  document.getElementById('featureBars').innerHTML = features.map(f => `
    <div class="feat-row">
      <div class="feat-header">
        <span class="feat-name">${f.name}</span>
        <span class="feat-pct">${f.pct}%</span>
      </div>
      <div class="feat-track">
        <div class="feat-fill" style="width:0;background:${f.color}" data-target="${f.pct}"></div>
      </div>
    </div>
  `).join('');

  setTimeout(() => {
    document.querySelectorAll('.feat-fill').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 100);
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');

  // Live updates while filling form
  ['applicantIncome', 'coapplicantIncome', 'loanAmount'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateLiveScore);
  });
  document.getElementById('education')?.addEventListener('change', updateLiveScore);
  document.getElementById('selfEmployed')?.addEventListener('change', updateLiveScore);
});
