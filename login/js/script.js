// ====================================
// INITIALIZATION
// ====================================
// sb_client is declared in /js/app-sb.js in the global scope
// We just need to initialize it here

let currentUser = null;
let userData = {
    authId: null,
    email: null,
    phone: null,
    fullName: null,
    picture: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    sb_client = initSB();

    if (!sb_client) {
        showError('error-step1', 'فشل تحميل النظام. أعد تحميل الصفحة.');
        return;
    }

    // Check URL params BEFORE cleaning
    const urlParams = new URLSearchParams(window.location.search);
    const fromIndex = urlParams.get('from') === 'index';
    const hasOAuthResponse = window.location.hash.includes('access_token');

    console.log('🔗 URL state:', { fromIndex, hasOAuthResponse, hash: window.location.hash ? 'HAS_HASH' : 'NO_HASH' });

    // If we have OAuth tokens in URL, let Supabase process them first
    if (hasOAuthResponse) {
        console.log('🔄 Processing OAuth response...');
        // Fresh OAuth = clear any previous redirect counters
        sessionStorage.removeItem('loginRedirectCount');
        sessionStorage.removeItem('authRedirectAttempt');
        // Supabase will auto-process the hash, wait for it
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Now check for session (after OAuth processing)
    const { data: { session }, error: sessionError } = await sb_client.auth.getSession();

    console.log('🔐 Session check:', { session: session ? 'EXISTS' : 'NONE', user: session?.user?.email, error: sessionError });

    // Clean URL AFTER session is established
    if (window.location.hash || window.location.search.includes('error=')) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('🧹 Cleaned URL');
    }

    if (session) {
        currentUser = session.user;
        // Don't auto-redirect if coming from index (means profile incomplete)
        await checkUserRegistration(currentUser, !fromIndex);
    }

    // Listen for auth changes (for OAuth redirect)
    let alreadyChecked = session ? true : false; // Skip if already checked on load

    // Listen for auth changes
    sb_client.auth.onAuthStateChange(async (event, session) => {
        console.log('🔔 Auth event:', event, session?.user?.email);

        // Only process SIGNED_IN if we haven't already checked
        if (event === 'SIGNED_IN' && session && !alreadyChecked) {
            alreadyChecked = true;
            currentUser = session.user;
            await checkUserRegistration(currentUser, true);
        }
    });

    // Input event listeners
    document.getElementById('phone-input').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    document.getElementById('phone-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePhoneSubmit();
    });

    document.getElementById('name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleFinish();
    });

    console.log('✅ Login system ready');
});

// ====================================
// CHECK USER REGISTRATION
// ====================================
async function checkUserRegistration(user, allowRedirect = true) {
    try {
        userData.authId = user.id;
        userData.email = user.email;

        // Extract name and picture from Google profile (user_metadata)
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const googlePicture = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        console.log('🔍 Checking user:', user.id);
        console.log('📷 Google profile:', { name: googleName, picture: googlePicture ? 'YES' : 'NO' });

        // Check if user exists in database
        const { data: existingUser, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .maybeSingle();

        console.log('📊 DB result:', { existingUser: existingUser ? 'EXISTS' : 'NEW', error });

        if (existingUser && existingUser.phone && existingUser.full_name) {
            // Existing user with complete profile
            sessionStorage.removeItem('authRedirectAttempt');
            sessionStorage.setItem('loginRedirectCount', (sessionStorage.getItem('loginRedirectCount') ? parseInt(sessionStorage.getItem('loginRedirectCount')) + 1 : 1).toString());
            console.log('✅ Profile COMPLETE! Redirecting... (attempt ' + (sessionStorage.getItem('loginRedirectCount') ? parseInt(sessionStorage.getItem('loginRedirectCount')) + 1 : 1) + ')');

            // Try absolute path with trailing slash for Vercel
            window.location.replace('/index');
            return;
        } else if (existingUser) {
            // User exists but incomplete profile
            userData.phone = existingUser.phone;
            userData.fullName = existingUser.full_name || googleName;
            userData.picture = existingUser.avatar_url || googlePicture;

            if (!existingUser.phone) {
                // Pre-fill name from Google if available
                if (googleName) {
                    document.getElementById('name-input').value = googleName;
                }
                console.log('📝 Phone missing, showing step 2');
                showStep(2);
            } else if (!existingUser.full_name) {
                // Use Google name automatically
                if (googleName) {
                    userData.fullName = googleName;
                    // Skip to finish directly with Google name
                    await finishWithGoogleProfile(googleName, googlePicture);
                    return;
                }
                console.log('📝 Name missing, showing step 3');
                showStep(3);
            }
        } else {
            // New user - create/update record with Google profile data
            console.log('👤 New user with Google profile:', googleName);

            userData.fullName = googleName;
            userData.picture = googlePicture;

            // Pre-fill name input
            if (googleName) {
                document.getElementById('name-input').value = googleName;
            }

            // Use upsert to handle existing email (different auth provider)
            const { data: newUser, error: insertError } = await supabaseClient
                .from('users')
                .upsert({
                    auth_id: user.id,
                    email: user.email,
                    full_name: googleName || null,
                    avatar_url: googlePicture || null
                }, {
                    onConflict: 'auth_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (insertError) {
                console.error('Upsert error:', insertError);
            } else {
                console.log('✅ User created:', newUser);
            }

            // Show phone step (name is already filled from Google)
            showStep(2);
        }
    } catch (error) {
        console.error('Check registration error:', error);
        showStep(2);
    }
}

// ====================================
// STEP 1: GOOGLE SIGN IN
// ====================================
async function handleGoogleSignIn() {
    const btn = document.getElementById('btn-google');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> جاري التسجيل...';

    try {
        // Use clean redirect URL (no query params or hash)
        const cleanRedirectUrl = window.location.origin + '/login';
        console.log('🔗 Redirect URL:', cleanRedirectUrl);

        const { data, error } = await sb_client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: cleanRedirectUrl
            }
        });

        if (error) throw error;

        // OAuth will redirect, so we don't need to do anything else
        console.log('✅ Redirecting to Google...');

    } catch (error) {
        console.error('Google Sign-in error:', error);
        showError('error-step1', 'فشل تسجيل الدخول: ' + error.message);
        resetGoogleButton();
    }
}

function resetGoogleButton() {
    const btn = document.getElementById('btn-google');
    btn.disabled = false;
    btn.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        تسجيل الدخول بحساب Google
    `;
}

// ====================================
// STEP 2: PHONE NUMBER
// ====================================
function handlePhoneSubmit() {
    const phoneInput = document.getElementById('phone-input');
    const phone = phoneInput.value.trim();

    if (phone.length !== 9 || !/^[0-9]+$/.test(phone)) {
        showError('error-step2', 'الرجاء إدخال رقم هاتف صحيح (9 أرقام)');
        phoneInput.focus();
        return;
    }

    userData.phone = '07' + phone;
    showStep(3);
}

// ====================================
// STEP 3: DEMOGRAPHICS
// ====================================
function selectGender(gender) {
    userData.gender = gender;
    const maleBtn = document.getElementById('gender-male');
    const femaleBtn = document.getElementById('gender-female');

    if (gender === 'male') {
        maleBtn.style.background = '#4CAF50';
        maleBtn.style.color = 'white';
        maleBtn.style.borderColor = '#4CAF50';
        femaleBtn.style.background = 'white';
        femaleBtn.style.color = '#333';
        femaleBtn.style.borderColor = '#ddd';
    } else {
        femaleBtn.style.background = '#E91E63';
        femaleBtn.style.color = 'white';
        femaleBtn.style.borderColor = '#E91E63';
        maleBtn.style.background = 'white';
        maleBtn.style.color = '#333';
        maleBtn.style.borderColor = '#ddd';
    }
}

function handleDemographicsSubmit() {
    const age = document.getElementById('age-input').value;
    const region = document.getElementById('region-input').value;

    if (!userData.gender) {
        showError('error-step3', 'الرجاء اختيار الجنس');
        return;
    }
    if (!age) {
        showError('error-step3', 'الرجاء اختيار العمر');
        return;
    }
    if (!region) {
        showError('error-step3', 'الرجاء اختيار المحافظة');
        return;
    }

    userData.age = age;
    userData.region = region;
    showStep(4);
    document.getElementById('name-input').focus();
}

// ====================================
// STEP 4: FULL NAME & FINISH
// ====================================
async function handleFinish() {
    const nameInput = document.getElementById('name-input');
    const fullName = nameInput.value.trim();

    if (fullName.length < 3) {
        showError('error-step4', 'الرجاء إدخال اسمك الكامل (3 أحرف على الأقل)');
        nameInput.focus();
        return;
    }

    userData.fullName = fullName;

    const btn = document.getElementById('btn-finish');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> جاري الحفظ...';

    try {
        console.log('💾 Saving user data:', {
            auth_id: userData.authId,
            email: userData.email,
            phone: userData.phone || 'NOT SET',
            full_name: userData.fullName,
            gender: userData.gender,
            age: userData.age,
            region: userData.region
        });

        // Save user to database with avatar and demographics
        const updateData = {
            auth_id: userData.authId,
            email: userData.email,
            full_name: userData.fullName,
            avatar_url: userData.picture || null,
            last_login: new Date().toISOString()
        };

        // Only add phone if it exists
        if (userData.phone) {
            updateData.phone = userData.phone;
        }

        // Only add demographics if they exist (to avoid column errors)
        if (userData.gender) {
            updateData.gender = userData.gender;
        }
        if (userData.age) {
            // Convert age range to number (take the lower bound) to match INTEGER column
            const ageNumber = parseInt(userData.age.split('-')[0]);
            updateData.age = ageNumber;
        }
        if (userData.region) {
            updateData.region = userData.region;
        }

        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout - please try again')), 10000)
        );

        const upsertPromise = sb_client
            .from('users')
            .upsert(updateData, {
                onConflict: 'auth_id'
            })
            .select()
            .single();

        const { data, error } = await Promise.race([upsertPromise, timeoutPromise]);

        if (error) {
            console.error('❌ Upsert error details:', error);
            // If demographics columns don't exist, try saving without them
            if (error.message && error.message.includes('column')) {
                console.log('🔄 Column error - trying to save without demographics...');
                const basicUpdateData = {
                    auth_id: userData.authId,
                    email: userData.email,
                    full_name: userData.fullName,
                    avatar_url: userData.picture || null,
                    last_login: new Date().toISOString()
                };
                if (userData.phone) {
                    basicUpdateData.phone = userData.phone;
                }

                const { data: retryData, error: retryError } = await sb_client
                    .from('users')
                    .upsert(basicUpdateData, {
                        onConflict: 'auth_id'
                    })
                    .select()
                    .single();

                if (retryError) {
                    console.error('❌ Retry also failed:', retryError);
                    throw retryError;
                }
                console.log('✅ Saved without demographics:', retryData);
            } else {
                throw error;
            }
        }

        console.log('✅ User saved:', data);

        // Show success and redirect
        showStep('success');

        setTimeout(() => {
            window.location.href = '/index';
        }, 1500);

    } catch (error) {
        console.error('Save user error:', error);
        showError('error-step3', 'حدث خطأ في الحفظ: ' + (error.message || 'Unknown error'));
        btn.disabled = false;
        btn.textContent = 'ابدأ التعلم 🚀';
    }
}

// Auto-finish with Google profile (when name is already available)
async function finishWithGoogleProfile(name, picture) {
    console.log('🚀 Auto-finishing with Google profile:', name);

    try {
        const { data, error } = await sb_client
            .from('users')
            .upsert({
                auth_id: userData.authId,
                email: userData.email,
                phone: userData.phone,
                full_name: name,
                avatar_url: picture || null,
                last_login: new Date().toISOString()
            }, {
                onConflict: 'auth_id'
            })
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Auto-saved with Google profile:', data);

        // Show success and redirect
        showStep('success');

        setTimeout(() => {
            window.location.href = '/index';
        }, 1500);

    } catch (error) {
        console.error('Auto-finish error:', error);
        // Fall back to manual name entry
        showStep(3);
    }
}

// ====================================
// UI HELPERS
// ====================================
function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });

    // Show target step
    const targetStep = stepNumber === 'success' ? 'step-success' : `step-${stepNumber}`;
    document.getElementById(targetStep).classList.add('active');

    // Update dots
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        dot.classList.remove('active', 'completed');

        if (stepNumber === 'success') {
            dot.classList.add('completed');
        } else if (index + 1 < stepNumber) {
            dot.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            dot.classList.add('active');
        }
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');

    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 4000);
}
