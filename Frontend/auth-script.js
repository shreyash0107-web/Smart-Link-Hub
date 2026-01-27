// Authentication JavaScript
const API_BASE = "https://smart-link-hub-nsve.onrender.com/api";
// Form toggle functionality
function toggleForm(formName) {
  document.querySelectorAll(".form-tab").forEach(tab => {
    tab.classList.remove("active");
  });
  document.getElementById(formName + "-form").classList.add("active");
  clearErrors();
}

// Clear all error messages
function clearErrors() {
  document.querySelectorAll(".error-msg").forEach(msg => {
    msg.textContent = "";
  });
  document.querySelectorAll(".success-msg").forEach(msg => {
    msg.textContent = "";
  });
}

// Show error message
function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + "-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

// Show general error
function showGeneralError(formType, message) {
  const errorEl = document.getElementById(formType + "-general-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

// Show success message
function showSuccess(formType, message) {
  const successEl = document.getElementById(formType + "-success-msg");
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = "block";
  }
}

// Validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Initialize form handlers
document.addEventListener("DOMContentLoaded", () => {
  // Sign In Form
  document.getElementById("signin").addEventListener("submit", handleSignIn);

  // Sign Up Form
  document.getElementById("signup").addEventListener("submit", handleSignUp);

  // Forgot Password Form
  document.getElementById("forgot").addEventListener("submit", handleForgotPassword);
});

// ==================== SIGN IN ====================
async function handleSignIn(event) {
  event.preventDefault();
  clearErrors();

  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;

  // Validation
  if (!email) {
    showError("signin-email", "Email is required");
    return;
  }

  if (!isValidEmail(email)) {
    showError("signin-email", "Please enter a valid email address");
    return;
  }

  if (!password) {
    showError("signin-password", "Password is required");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showGeneralError("signin", data.error || "Invalid credentials. Please try again.");
      return;
    }
    try {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  console.log("LOGIN RESPONSE:", response.status, data);

  if (!response.ok) {
    showError("signin-general", data.error || "Invalid credentials");
    return;
  }

  // ✅ SUCCESS
  localStorage.setItem("token", data.token);
  window.location.href = "admin.html";

} catch (err) {
  console.error("Login error:", err);
  showError("signin-general", "Server error. Try again.");
}


    // Save token and redirect
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userEmail", data.email);
    
    showSuccess("signin", "Signing in...");
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 500);
  } catch (error) {
    console.error("Sign in error:", error);
    showGeneralError("signin", "Failed to sign in. Please try again.");
  }
}

// ==================== SIGN UP ====================
async function handleSignUp(e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  // Validation
  try {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  console.log("SIGNUP RESPONSE:", response.status, data);

  if (!response.ok) {
    showError("signup-general", data.error || "Signup failed");
    return;
  }

  alert("Account created! Please sign in.");
  toggleForm("signin");

} catch (err) {
  console.error("Signup error:", err);
  showError("signup-general", "Server error. Try again.");
}

  if (!name) {
    showError("signup-name", "Full name is required");
    return;
  }

  if (name.length < 2) {
    showError("signup-name", "Name must be at least 2 characters");
    return;
  }

  if (!email) {
    showError("signup-email", "Email is required");
    return;
  }

  if (!isValidEmail(email)) {
    showError("signup-email", "Please enter a valid email address");
    return;
  }

  if (!password) {
    showError("signup-password", "Password is required");
    return;
  }

  if (password.length < 6) {
    showError("signup-password", "Password must be at least 6 characters");
    return;
  }

  if (password !== confirm) {
    showError("signup-confirm", "Passwords do not match");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showGeneralError("signup", data.error || "Failed to create account. This email may already be registered.");
      return;
    }

    // Auto sign in after signup
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userEmail", data.email);
    
    showSuccess("signup", "Account created! Redirecting...");
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 500);
  } catch (error) {
    console.error("Sign up error:", error);
    showGeneralError("signup", "Failed to create account. Please try again.");
  }
}

// ==================== FORGOT PASSWORD ====================
async function handleForgotPassword(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById("forgot-email").value.trim();

  if (!email) {
    showError("forgot-email", "Email is required");
    return;
  }

  if (!isValidEmail(email)) {
    showError("forgot-email", "Please enter a valid email address");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      showGeneralError("forgot", data.error || "Failed to process request");
      return;
    }

    showSuccess("forgot", "✓ If this email exists, you'll receive a password reset link shortly.");
    document.getElementById("forgot-email").value = "";
  } catch (error) {
    console.error("Forgot password error:", error);
    showGeneralError("forgot", "Failed to process request. Please try again.");
  }
}

// Check if already logged in
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    // Already logged in, redirect to dashboard
    window.location.href = "admin.html";
  }
});
