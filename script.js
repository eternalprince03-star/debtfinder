// 1. Configuration: Uses the URL and Key specific to your project
const supabaseUrl = 'https://dahwstpnxsumkxexpyla.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaHdzdHBueHN1bWt4ZXhweWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTQxNTEsImV4cCI6MjA4ODgzMDE1MX0.Z2xrUOjK226-tqxCTXIkKEAInaBbyKTjwD_joJWsHjU';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const authOverlay = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const mainContent = document.getElementById('main-content');
    const returnBtn = document.getElementById('return-home');
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-data');
    
    // We assume 'login' mode by default as per your HTML structure
    let authMode = 'login'; 

    // 2. Authentication Logic: Matches your requested screenshot exactly
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Visual feedback (Note: ensure your button has the class 'btn-primary')
        const authBtn = loginForm.querySelector('button');
        authBtn.innerText = "Processing...";
        authBtn.disabled = true;

        // Execute the Supabase call
        const { data, error } = (authMode === 'signup')
            ? await _supabase.auth.signUp({ email, password })
            : await _supabase.auth.signInWithPassword({ email, password });

        if (error) {
            // Handle errors like "Invalid credentials"
            alert(`Auth Error: ${error.message}`);
            authBtn.innerText = authMode === 'signup' ? 'Sign Up' : 'Continue to Dashboard';
            authBtn.disabled = false;
        } else {
            // Success Logic
            if (authMode === 'signup' && !data.session) {
                alert("Sign-up successful! Please check your email inbox for a confirmation link.");
                authBtn.innerText = 'Sign Up';
                authBtn.disabled = false;
            } else {
                // Logged in successfully: transition to dashboard
                authOverlay.classList.add('hidden'); 
                mainContent.classList.remove('hidden'); 
            }
        }
    });

    // Navigation and Dashboard Logic
    returnBtn.addEventListener('click', () => {
        mainContent.classList.add('hidden');
        authOverlay.classList.remove('hidden');
        loginForm.reset();
    });

    analyzeBtn.addEventListener('click', () => {
        const principal = 25000; 
        const annualRate = 0.05;
        document.getElementById('principal-val').innerText = `$${principal.toLocaleString()}`;
        document.getElementById('status-tag').innerText = 'Active / Unpaid';
        const prediction = principal * Math.pow((1 + annualRate / 12), 12);
        document.getElementById('projection-val').innerText = `$${prediction.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
        displayResolutions(document.getElementById('address').value);
    });

    function displayResolutions(address) {
        const container = document.getElementById('resolution-options');
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid var(--success)">
                <h4>Income-Driven Repayment</h4>
                <p>Adjust monthly payments based on current earnings.</p>
            </div>
            <div class="card" style="border-left: 4px solid var(--primary)">
                <h4>Local Refinancing</h4>
                <p>Check options available near ${address || 'your location'}.</p>
            </div>
        `;
    }

    clearBtn.addEventListener('click', () => {
        if(confirm("Clear all data?")) location.reload();
    });
});
