const supabaseUrl = 'https://dahwstpnxsumkxexpyla.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaHdzdHBueHN1bWt4ZXhweWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTQxNTEsImV4cCI6MjA4ODgzMDE1MX0.Z2xrUOjK226-tqxCTXIkKEAInaBbyKTjwD_joJWsHjU';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

let authMode = 'login';

// --- View Navigation ---
function navigateTo(viewId) {
    document.querySelectorAll('.view-container').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

function switchAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${mode}`).classList.add('active');
    document.getElementById('auth-btn').innerText = mode === 'login' ? 'Log In' : 'Sign Up';
}

// --- Auth Logic ---
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const authBtn = document.getElementById('auth-btn');

    authBtn.innerText = "Processing...";
    authBtn.disabled = true;

    const { data, error } = (authMode === 'signup')
        ? await _supabase.auth.signUp({ email, password })
        : await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert(`Auth Error: ${error.message}`);
        authBtn.disabled = false;
        authBtn.innerText = authMode === 'signup' ? 'Sign Up' : 'Log In';
    } else {
        // Success: Proceed to Education View
        navigateTo('view-edu');
    }
});

// --- Analysis Logic ---
document.getElementById('analyze-btn').addEventListener('click', () => {
    // Simulate parsing the uploaded college document
    const principal = 32000;
    const rate = 0.06;
    
    document.getElementById('results-display').classList.remove('hidden');
    document.getElementById('principal-val').innerText = `$${principal.toLocaleString()}`;
    document.getElementById('status-tag').innerText = "Active Accumulation";
    
    const futureVal = principal * Math.pow((1 + rate / 12), 12);
    document.getElementById('projection-val').innerText = `$${futureVal.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
    
    document.getElementById('analyze-btn').classList.add('hidden');
    document.getElementById('to-steps-btn').classList.remove('hidden');
    
    populateSteps();
});

function populateSteps() {
    const list = document.getElementById('action-list');
    list.innerHTML = `
        <div class="step-card">
            <h4>1. Consolidate High-Interest Loans</h4>
            <p>Based on your documents, your 6% interest rate is higher than current consolidation averages.</p>
        </div>
        <div class="step-card">
            <h4>2. Income-Driven Repayment (IDR)</h4>
            <p>You may qualify for a $0/mo payment based on standard student entry levels.</p>
        </div>
    `;
}

document.getElementById('to-steps-btn').addEventListener('click', () => navigateTo('view-steps'));
