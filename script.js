// --- Supabase Configuration ---
const SUPABASE_URL = 'https://dahwstpnxsumkxexpyla.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eL52f21Lte7rvsLPfY2-3w_PmLaIIDj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- State Management ---
let authMode = 'login';

// --- DOM Elements ---
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const logoutBtn = document.getElementById('logout-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const fileInput = document.getElementById('document-upload');
const addressForm = document.getElementById('address-form');
const clearBtn = document.getElementById('clear-btn');

// --- 1. Authentication Logic ---
window.switchTab = (mode) => {
    authMode = mode;
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
    document.getElementById('auth-btn').textContent = mode === 'login' ? 'Log In' : 'Sign Up';
};

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = (authMode === 'signup') 
        ? await _supabase.auth.signUp({ email, password })
        : await _supabase.auth.signInWithPassword({ email, password });

    if (error) alert(`Auth Error: ${error.message}`);
    else checkSession();
});

logoutBtn.addEventListener('click', async () => {
    await _supabase.auth.signOut();
    checkSession();
});

// --- 2. Database & Session Persistence ---
async function checkSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (session) {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        fetchUserData(session.user.id);
    } else {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }
}

async function fetchUserData(userId) {
    const { data, error } = await _supabase
        .from('user_debt_records')
        .select('*')
        .eq('id', userId)
        .single();

    if (data) {
        if (data.debt_amount) showDebtAnalysis(data.debt_amount, data.debt_status);
        if (data.user_address) showSolutions(data.user_address);
    }
}

async function upsertUserData(updates) {
    const { data: { user } } = await _supabase.auth.getUser();
    const { error } = await _supabase
        .from('user_debt_records')
        .upsert({ id: user.id, ...updates });

    if (error) console.error("Error saving to DB:", error.message);
}

// --- 3. Functional Features ---
fileInput.addEventListener('change', () => {
    analyzeBtn.disabled = fileInput.files.length === 0;
});

analyzeBtn.addEventListener('click', () => {
    document.getElementById('loading-spinner').classList.remove('hidden');
    analyzeBtn.disabled = true;

    // Simulate AI analysis delay
    setTimeout(async () => {
        const principal = 42500; // Simulated data from document
        const status = 'Active / Interest Accruing';
        
        await upsertUserData({ debt_amount: principal, debt_status: status });
        
        document.getElementById('loading-spinner').classList.add('hidden');
        showDebtAnalysis(principal, status);
    }, 2000);
});

function showDebtAnalysis(principal, status) {
    document.getElementById('analysis-section').classList.remove('hidden');
    document.getElementById('solutions-section').classList.remove('hidden');
    document.getElementById('upload-section').classList.add('hidden'); // Clean UI after upload

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('debt-amount').textContent = formatter.format(principal);
    document.getElementById('debt-status').textContent = status;

    // Compound Interest Prediction Logic
    const list = document.getElementById('prediction-list');
    list.innerHTML = '';
    const rate = 0.065; // 6.5% standard
    for (let i = 1; i <= 5; i++) {
        let futureValue = principal * Math.pow((1 + rate), i);
        let li = document.createElement('li');
        li.innerHTML = `<span>Year ${new Date().getFullYear() + i}</span> <strong>${formatter.format(futureValue)}</strong>`;
        list.appendChild(li);
    }
}

addressForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const addr = document.getElementById('user-address').value;
    await upsertUserData({ user_address: addr });
    showSolutions(addr);
});

function showSolutions(address) {
    document.getElementById('user-address').value = address;
    const solList = document.getElementById('solutions-list');
    document.getElementById('actionable-solutions').classList.remove('hidden');
    
    // Customized response based on presence of address
    solList.innerHTML = `
        <div class="luminous-solution-card glass-panel">
            <div class="card-icon cyan">✦</div>
            <div class="card-content">
                <h5>Location-Based Grant Search</h5>
                <p>Analyzing local mitigation options for: ${address}</p>
            </div>
        </div>
        <div class="luminous-solution-card glass-panel">
            <div class="card-icon cyan">✦</div>
            <div class="card-content">
                <h5>Federal Consolidation</h5>
                <p>Standard federal options to mitigate current interest growth.</p>
            </div>
        </div>
    `;
}

// --- 4. Global Reset ---
clearBtn.addEventListener('click', async () => {
    if (confirm("This will permanently delete your records from the database. Proceed?")) {
        const { data: { user } } = await _supabase.auth.getUser();
        await _supabase.from('user_debt_records').delete().eq('id', user.id);
        location.reload(); // Refresh to clear UI state
    }
});

// Start application
checkSession();
