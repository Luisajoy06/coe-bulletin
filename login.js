// --------------------------
// 🚀 FIREBASE CONFIG
// --------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDCHE1ZNcFDatmha2kLqEGgwcxGc51KkFY",
  authDomain: "coe-bulletin.firebaseapp.com",
  databaseURL: "https://coe-bulletin-default-rtdb.firebaseio.com",
  projectId: "coe-bulletin",
  storageBucket: "coe-bulletin.firebasestorage.app",
  messagingSenderId: "185761844906",
  appId: "1:185761844906:web:2289ffaa70e64e13ce0ad3",
  measurementId: "G-PZMSXXJKCL"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --------------------------
// 🔄 SWITCH FORMS
// --------------------------
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

document.getElementById("toLogin").addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
});

document.getElementById("toRegister").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
});

// --------------------------
// 📝 REGISTER USER
// --------------------------
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const msg = document.getElementById("registerMessage");

  auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return cred.user.updateProfile({ displayName: name });
    })
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Registration successful! You may now login.";
      registerForm.reset();
    })
    .catch((err) => {
      msg.style.color = "red";
      msg.textContent = err.message.replace("Firebase:", "");
    });
});

// --------------------------
// 🔐 LOGIN USER
// --------------------------
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMessage");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Login successful! Redirecting...";
      setTimeout(() => window.location.href = "index.html", 1000);
    })
    .catch((err) => {
      msg.style.color = "red";
      msg.textContent = err.message.replace("Firebase:", "");
    });
});

// --------------------------
// 🔄 AUTH STATE
// --------------------------
auth.onAuthStateChanged((user) => {
  if (user) console.log("Logged in:", user.email);
  else console.log("Logged out");
});
