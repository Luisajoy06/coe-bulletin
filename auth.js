// -------------------------
// FRONTEND AUTH SYSTEM
// -------------------------

// Get token
function getToken() {
  return localStorage.getItem("token");
}

// Check if logged in
function isLoggedIn() {
  return !!getToken();
}

// PROTECT PAGE  
// If no token, redirect to login.html
function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = "login.html"; // Login page
  }
}

// PREVENT ACCESS TO LOGIN PAGE WHEN LOGGED IN
function blockIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = "index.html"; // Dashboard
  }
}

// Remove token -> logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
