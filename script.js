// --- Supabase Configuration ---
const SUPABASE_URL = 'https://dahwstpnxsumkxexpyla.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eL52f21Lte7rvsLPfY2-3w_PmLaIIDj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- State Management ---
let authMode = 'login';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const authForm = document.getElementById('auth-form');
    const logoutBtn = document.getElementById('logout-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const fileInput = document.getElementById('document-upload');
    const addressForm = document.getElementById('address-form');
    const clearBtn = document.getElementById('clear-btn');
    const authBtn = document.getElementById('auth-btn');

    // --- 1. Authentication Logic ---
    window.switchTab = (mode) => {
        authMode = mode;
        document.getElementById('tab-login').classList.toggle('active', mode === 'login');
        document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
        authBtn.textContent = mode === 'login' ? 'Log In' : 'Sign Up';
    };

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Visual feedback
        authBtn.innerText = "Processing...";
        authBtn.disabled = true;

        const { data, error } = (authMode === 'signup') 
            ? await _supabase.auth.signUp({ email, password })
            : await _supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert(`Auth Error: ${error.message}`);
            authBtn.innerText = authMode === 'signup' ? 'Sign Up' : 'Log In';
            authBtn.disabled = false;
        } else {
            // SUCCESS LOGIC
            if (authMode === 'signup' && !data.session) {
                alert("Sign-up successful! Please check your email for a confirmation link to activate your account.");
                authBtn.innerText = 'Sign Up';
                authBtn.disabled = false;
            } else {
                checkSession();
            }
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await _supabase.auth.signOut();
        checkSession();
    });

    // --- 2. Session & Database ---
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
        const { data } = await _supabase
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
        if (!user) return;

        const { error } = await _supabase
            .from('user_debt_records')
            .upsert({ id: user.id, ...updates });

        if (error) console.error("Error saving to DB:", error.message);
    }

    // --- 3. UI Features ---
    fileInput.addEventListener('change', () => {
        analyzeBtn.disabled = fileInput.files.length === 0;
    });

    analyzeBtn.addEventListener('click', () => {
        document.getElementById('loading-spinner').classList.remove('hidden');
        analyzeBtn.disabled = true;

        setTimeout(async () => {
            const principal = 42500; 
            const status = 'Active / Interest Accruing';
            await upsertUserData({ debt_amount: principal, debt_status: status });
            document.getElementById('loading-spinner').classList.add('hidden');
            showDebtAnalysis(principal, status);
        }, 2000);
    });

    addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert("The button was clicked! Attempting to connect to Supabase...");
        
        const addr = document.getElementById('user-address').value;
        await upsertUserData({ user_address: addr });
        showSolutions(addr);
    });

    // --- 4. Global Reset (With Safety Check) ---
    clearBtn.addEventListener('click', async () => {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (!user) {
            alert("No active session found.");
            return;
        }

        if (confirm("This will permanently delete your records. Proceed?")) {
            await _supabase.from('user_debt_records').delete().eq('id', user.id);
            location.reload();
        }
    });

    function showDebtAnalysis(principal, status) {
        document.getElementById('analysis-section').classList.remove('hidden');
        document.getElementById('solutions-section').classList.remove('hidden');
        document.getElementById('upload-section').classList.add('hidden');

        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        document.getElementById('debt-amount').textContent = formatter.format(principal);
        document.getElementById('debt-status').textContent = status;

        const list = document.getElementById('prediction-list');
        list.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            let futureValue = principal * Math.pow(1.065, i);
            let li = document.createElement('li');
            li.innerHTML = `<span>Year ${new Date().getFullYear() + i}</span> <strong>${formatter.format(futureValue)}</strong>`;
            list.appendChild(li);
        }
    }

    function showSolutions(address) {
        document.getElementById('user-address').value = address;
        document.getElementById('actionable-solutions').classList.remove('hidden');
        document.getElementById('solutions-list').innerHTML = `
            <div class="luminous-solution-card glass-panel">
                <div class="card-icon cyan">✦</div>
                <div class="card-content">
                    <h5>Localized Mitigation Program</h5>
                    <p>Found potential state-level matches for: ${address}</p>
                </div>
            </div>
        `;
    }

    // Run initial check
    checkSession();
});
