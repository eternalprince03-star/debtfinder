// --- View Management ---
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const logoutBtn = document.getElementById('logout-btn');

// --- Dashboard Elements ---
const fileInput = document.getElementById('document-upload');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const analysisSection = document.getElementById('analysis-section');
const solutionsSection = document.getElementById('solutions-section');
const addressForm = document.getElementById('address-form');
const actionableSolutions = document.getElementById('actionable-solutions');
const clearBtn = document.getElementById('clear-btn');

// --- Tab Switching Logic (Login / Sign up) ---
function switchTab(mode) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const btn = document.getElementById('auth-btn');
    btn.textContent = mode === 'login' ? 'Log In' : 'Sign Up';
}

// --- Authentication Simulation ---
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate successful login/signup
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    authForm.reset();
});

logoutBtn.addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    authView.classList.remove('hidden');
    resetDashboard(); // Clear data on logout for privacy
});

// --- File Upload & Analysis Simulation ---
fileInput.addEventListener('change', () => {
    analyzeBtn.disabled = fileInput.files.length === 0;
});

analyzeBtn.addEventListener('click', () => {
    // Correcting a small bug from before: analyzeBtn should hide, not just disable.
    analyzeBtn.disabled = true;
    loadingSpinner.classList.remove('hidden');

    // Simulate backend OCR/Processing delay (2 seconds)
    setTimeout(() => {
        analyzeBtn.classList.add('hidden'); // Fully hide after analyze
        loadingSpinner.classList.add('hidden');
        analysisSection.classList.remove('hidden');
        solutionsSection.classList.remove('hidden');
        
        // Mock extracted data (Status updated for higher depth tone)
        populateDebtData(35400, 0.065, 'Mitigation Advised'); // $35,400 debt at 6.5% interest
    }, 2000);
});

// --- Debt Math & UI Population ---
function populateDebtData(principal, interestRate, statusText) {
    // Format Currency
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    
    document.getElementById('debt-amount').textContent = formatter.format(principal);
    document.getElementById('debt-status').textContent = statusText;
    
    // Generate Predictions (Compound Interest for next 5 years)
    const predictionList = document.getElementById('prediction-list');
    predictionList.innerHTML = ''; // Clear old data
    
    const currentYear = new Date().getFullYear();
    
    for (let i = 1; i <= 5; i++) {
        // Simple compound interest formula: A = P(1 + r)^t
        let futureAmount = principal * Math.pow((1 + interestRate), i);
        
        let li = document.createElement('li');
        li.innerHTML = `<span>Year ${currentYear + i}</span> <strong>${formatter.format(futureAmount)}</strong>`;
        predictionList.appendChild(li);
    }
}

// --- Address & Solutions Simulation ---
addressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Once address is entered, reveal the customized solutions
    actionableSolutions.classList.remove('hidden');
});

// --- Clear Information ---
function resetDashboard() {
    fileInput.value = '';
    analyzeBtn.disabled = true;
    analyzeBtn.classList.remove('hidden');
    
    analysisSection.classList.add('hidden');
    solutionsSection.classList.add('hidden');
    actionableSolutions.classList.add('hidden');
    
    document.getElementById('user-address').value = '';
}

clearBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
        resetDashboard();
    }
});
