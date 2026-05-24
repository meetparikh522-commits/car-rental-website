document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authButtons = document.querySelector('.auth-buttons');
    const signupPassword = document.getElementById('signup-password');

    const getUsers = () => {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            return Array.isArray(users) ? users : [];
        } catch (error) {
            localStorage.setItem('users', JSON.stringify([]));
            return [];
        }
    };

    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    const setCurrentUser = (user) => {
        const safeUser = { ...user };
        localStorage.setItem('loggedInUser', JSON.stringify(safeUser));
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
    };

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('currentUser');
            return null;
        }
    };

    // Check login status on page load
    if (getCurrentUser()) {
        updateNavForLoggedInUser();
    }

    // --- Real-time Validation Listeners ---

    // 1. Signup Form Fields
    const signupNameInput = document.getElementById('signup-name');
    if (signupNameInput) {
        ['input', 'blur'].forEach(evt => {
            signupNameInput.addEventListener(evt, () => {
                const val = signupNameInput.value.trim();
                if (!val) {
                    showError(signupNameInput, 'Full Name is required');
                } else if (val.length < 2) {
                    showError(signupNameInput, 'Name must be at least 2 characters');
                } else {
                    showSuccess(signupNameInput);
                }
            });
        });
    }

    const signupEmailInput = document.getElementById('signup-email');
    if (signupEmailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        ['input', 'blur'].forEach(evt => {
            signupEmailInput.addEventListener(evt, () => {
                const val = signupEmailInput.value.trim();
                if (!val) {
                    showError(signupEmailInput, 'Email address is required');
                } else if (!emailRegex.test(val)) {
                    showError(signupEmailInput, 'Please enter a valid email address (e.g. name@example.com)');
                } else {
                    const users = getUsers();
                    if (users.some(u => (u.email || '').toLowerCase() === val.toLowerCase())) {
                        showError(signupEmailInput, 'This email is already registered');
                    } else {
                        showSuccess(signupEmailInput);
                    }
                }
            });
        });
    }

    if (signupPassword) {
        ['input', 'blur'].forEach(evt => {
            signupPassword.addEventListener(evt, () => {
                const val = signupPassword.value.trim();
                const isLength = val.length >= 8;
                const isUpper = /[A-Z]/.test(val);
                const isLower = /[a-z]/.test(val);
                const isNumber = /[0-9]/.test(val);
                const isSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

                if (!val) {
                    showError(signupPassword, 'Password is required');
                } else if (!isLength || !isUpper || !isLower || !isNumber || !isSpecial) {
                    showError(signupPassword, 'Password must meet all checklist criteria below');
                } else {
                    showSuccess(signupPassword);
                }
            });
        });
    }

    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput) {
        ['input', 'blur'].forEach(evt => {
            confirmPasswordInput.addEventListener(evt, () => {
                const confirmVal = confirmPasswordInput.value.trim();
                const passwordVal = signupPassword ? signupPassword.value.trim() : '';

                if (!confirmVal) {
                    showError(confirmPasswordInput, 'Please confirm your password');
                } else if (confirmVal !== passwordVal) {
                    showError(confirmPasswordInput, 'Passwords do not match');
                } else {
                    showSuccess(confirmPasswordInput);
                }
            });
        });
    }

    // 2. Login Form Fields
    const loginEmailInput = document.getElementById('login-email');
    if (loginEmailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        ['input', 'blur'].forEach(evt => {
            loginEmailInput.addEventListener(evt, () => {
                const val = loginEmailInput.value.trim();
                if (!val) {
                    showError(loginEmailInput, 'Email is required');
                } else if (!emailRegex.test(val)) {
                    showError(loginEmailInput, 'Please enter a valid email address');
                } else {
                    showSuccess(loginEmailInput);
                }
            });
        });
    }

    const loginPasswordInput = document.getElementById('login-password');
    if (loginPasswordInput) {
        ['input', 'blur'].forEach(evt => {
            loginPasswordInput.addEventListener(evt, () => {
                const val = loginPasswordInput.value.trim();
                if (!val) {
                    showError(loginPasswordInput, 'Password is required');
                } else {
                    showSuccess(loginPasswordInput);
                }
            });
        });
    }

    // --- Submit Handlers ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignup();
        });
    }

    // Real-time password verification checklist
    if (signupPassword) {
        signupPassword.addEventListener('input', (e) => {
            const val = e.target.value;
            const reqs = {
                length: val.length >= 8,
                uppercase: /[A-Z]/.test(val),
                lowercase: /[a-z]/.test(val),
                number: /[0-9]/.test(val),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
            };

            const reqsContainer = document.getElementById('password-reqs');
            if (reqsContainer) {
                if (val.length > 0) {
                    reqsContainer.classList.add('visible');
                } else {
                    reqsContainer.classList.remove('visible');
                }

                for (const [key, isMet] of Object.entries(reqs)) {
                    const reqEl = reqsContainer.querySelector(`[data-req="${key}"]`);
                    if (reqEl) {
                        const icon = reqEl.querySelector('i');
                        if (isMet) {
                            reqEl.classList.add('met');
                            reqEl.classList.remove('unmet');
                            if (icon) {
                                icon.className = 'fas fa-check-circle';
                            }
                        } else {
                            reqEl.classList.remove('met');
                            if (val.length > 0) {
                                reqEl.classList.add('unmet');
                            } else {
                                reqEl.classList.remove('unmet');
                            }
                            if (icon) {
                                icon.className = 'far fa-circle';
                            }
                        }
                    }
                }
            }
        });
    }

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput =
                (toggle.dataset && toggle.dataset.targetId ? document.getElementById(toggle.dataset.targetId) : null) ||
                toggle.previousElementSibling ||
                toggle.parentElement && toggle.parentElement.querySelector('input[type="password"], input[type="text"]');

            if (!passwordInput || !passwordInput.type) return;

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggle.classList.remove('fa-eye-slash');
                toggle.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                toggle.classList.remove('fa-eye');
                toggle.classList.add('fa-eye-slash');
            }
        });
    });

    function handleLogin() {
        clearErrors(loginForm);
        const email = (document.getElementById('login-email').value || '').trim().toLowerCase();
        const password = (document.getElementById('login-password').value || '').trim();
        
        let isValid = true;
        
        // Custom check to allow username 'admin' or standard email
        const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isAdminEmail = email === 'admin@luxego.com' || email === 'admin';
        const isAdminPassword = password === 'admin123' || password === 'admin';

        if (!email) {
            showError(document.getElementById('login-email'), 'Email is required');
            isValid = false;
        } else if (!isEmailFormat && !isAdminEmail) {
            showError(document.getElementById('login-email'), 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showError(document.getElementById('login-password'), 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // Check if admin is logging in from main form
        if (isAdminEmail && isAdminPassword) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            const adminUser = { email: 'admin@luxego.com', name: 'Administrator', role: 'admin' };
            setCurrentUser(adminUser);
            localStorage.setItem('loggedInUser', JSON.stringify(adminUser));
            window.location.href = 'admin.html';
            return;
        }

        const users = getUsers();
        const user = users.find(u => (u.email || '').toLowerCase() === email && u.password === password);

        if (user) {
            setCurrentUser(user);
            window.location.href = 'index.html';
        } else {
            showError(document.getElementById('login-password'), 'Invalid email or password combination');
        }
    }

    function handleSignup() {
        clearErrors(signupForm);
        const name = (document.getElementById('signup-name').value || '').trim();
        const email = (document.getElementById('signup-email').value || '').trim().toLowerCase();
        const password = (document.getElementById('signup-password').value || '').trim();
        const confirmPassword = (document.getElementById('confirm-password').value || '').trim();

        if (!validateSignup(name, email, password, confirmPassword)) {
            return;
        }

        const users = getUsers();
        if (users.some(u => (u.email || '').toLowerCase() === email)) {
            showError(document.getElementById('signup-email'), 'This email is already registered');
            return;
        }

        const newUser = { id: `${Date.now()}`, name, email, password, loyaltyPoints: 0 };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        window.location.href = 'index.html';
    }

    function validateSignup(name, email, password, confirmPassword) {
        let isValid = true;

        // Name validation
        if (!name) {
            showError(document.getElementById('signup-name'), 'Full Name is required');
            isValid = false;
        } else if (name.length < 2) {
            showError(document.getElementById('signup-name'), 'Name must be at least 2 characters');
            isValid = false;
        } else {
            showSuccess(document.getElementById('signup-name'));
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showError(document.getElementById('signup-email'), 'Email address is required');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError(document.getElementById('signup-email'), 'Please enter a valid email (e.g. name@example.com)');
            isValid = false;
        } else {
            showSuccess(document.getElementById('signup-email'));
        }

        // Password validation rules
        const isLength = password.length >= 8;
        const isUpper = /[A-Z]/.test(password);
        const isLower = /[a-z]/.test(password);
        const isNumber = /[0-9]/.test(password);
        const isSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!password) {
            showError(document.getElementById('signup-password'), 'Password is required');
            isValid = false;
        } else if (!isLength || !isUpper || !isLower || !isNumber || !isSpecial) {
            showError(document.getElementById('signup-password'), 'Password does not meet all requirement conditions');
            isValid = false;
        } else {
            showSuccess(document.getElementById('signup-password'));
        }

        // Confirm password validation
        if (!confirmPassword) {
            showError(document.getElementById('confirm-password'), 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(document.getElementById('confirm-password'), 'Passwords do not match');
            isValid = false;
        } else {
            showSuccess(document.getElementById('confirm-password'));
        }

        return isValid;
    }

    function showError(input, message) {
        if (!input) return;
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        const errorContainer = formGroup.querySelector('.error-message');

        if (errorContainer) {
            errorContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        }
    }

    function showSuccess(input) {
        if (!input) return;
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        const errorContainer = formGroup.querySelector('.error-message');

        if (errorContainer) {
            errorContainer.innerHTML = '';
        }
    }

    function clearErrors(form) {
        if (!form) return;
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            group.classList.remove('success');
            const err = group.querySelector('.error-message');
            if (err) err.innerHTML = '';
        });
    }

    function updateNavForLoggedInUser() {
        const user = getCurrentUser();
        if (user && authButtons) {
            authButtons.innerHTML = `
                <span class="welcome-message">Welcome, ${user.name}</span>
                <button id="logout-btn" class="btn">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isAdminLoggedIn');
                window.location.href = 'login.html';
            });
        }
    }
});
