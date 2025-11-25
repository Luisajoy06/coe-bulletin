/* =====================================================
   GLOBAL UI ELEMENTS (modals, panels, profile, lightbox)
   ===================================================== */

/* Panels */
const aboutPanel = document.getElementById("about-panel");
const contactPanel = document.getElementById("contact-panel");

/* Modals */
const postModal = document.getElementById("post-modal");
const eventModal = document.getElementById("event-modal");
const updateModal = document.getElementById("update-modal");
const achievementModal = document.getElementById("achievement-modal");

/* Open buttons */
const openPostBtn = document.getElementById("open-post-btn");
const openEventBtn = document.getElementById("open-event-btn");
const openUpdateBtn = document.getElementById("open-update-btn");
const openAchievementBtn = document.getElementById("open-achievement-btn");

/* Close buttons */
const closePostBtn = document.getElementById("close-modal");
const closeEventBtn = document.getElementById("close-event-modal");
const closeUpdateBtn = document.getElementById("close-update-modal");
const closeAchievementBtn = document.getElementById("close-achievement-modal");

/* Lightbox */
const lightbox = document.getElementById("lightbox");

/* Content containers */
const announcementsContainer = document.getElementById("dynamic-posts");
const eventsContainer = document.getElementById("dynamic-events");
const updatesContainer = document.getElementById("dynamic-updates");
const achievementsContainer = document.getElementById("dynamic-achievements");

/* Profile elements */
const profileContainer = document.querySelector(".profile-container");
const profileAvatar = document.getElementById("profileAvatar");
const profileMenu = document.getElementById("profileMenu");
const menuAvatar = document.getElementById("menuAvatar");
const menuName = document.getElementById("menuName");
const menuEmail = document.getElementById("menuEmail");
const logoutBtn = document.getElementById("logoutBtn");
const manageAccountLink = document.getElementById("manageAccountLink");

/* Small safety checks for missing elements (avoid runtime errors) */
function el(id) { return document.getElementById(id); }

/* =====================================================
   UTILS
   ===================================================== */

/* Escape HTML to avoid XSS when rendering text from DB */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* File input -> DataURL */
function readImageInput(fileInput) {
  return new Promise((resolve) => {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(fileInput.files[0]);
  });
}

/* Toggle element visibility (adds/removes "hidden" class) */
function showModal(modalEl) { modalEl.classList.remove("hidden"); }
function hideModal(modalEl) { modalEl.classList.add("hidden"); }

/* =====================================================
   UI: ABOUT / CONTACT toggles
   (unchanged behaviour)
   ===================================================== */
document.getElementById("btn-about").addEventListener("click", () => {
  aboutPanel.classList.toggle("active");
  contactPanel.classList.remove("active");
});

document.getElementById("btn-contact").addEventListener("click", () => {
  contactPanel.classList.toggle("active");
  aboutPanel.classList.remove("active");
});

/* =====================================================
   MODALS: open/close (unchanged)
   ===================================================== */
if (openPostBtn) openPostBtn.onclick = () => showModal(postModal);
if (openEventBtn) openEventBtn.onclick = () => showModal(eventModal);
if (openUpdateBtn) openUpdateBtn.onclick = () => showModal(updateModal);
if (openAchievementBtn) openAchievementBtn.onclick = () => showModal(achievementModal);

if (closePostBtn) closePostBtn.onclick = () => hideModal(postModal);
if (closeEventBtn) closeEventBtn.onclick = () => hideModal(eventModal);
if (closeUpdateBtn) closeUpdateBtn.onclick = () => hideModal(updateModal);
if (closeAchievementBtn) closeAchievementBtn.onclick = () => hideModal(achievementModal);

/* click outside modal to close */
document.querySelectorAll(".modal").forEach(m => {
  m.addEventListener("click", (e) => {
    if (e.target === m) m.classList.add("hidden");
  });
});

/* =====================================================
   LIGHTBOX (image preview)
   ===================================================== */
document.addEventListener("click", (e) => {
  // open lightbox only when clicking an element with .post-image class
  if (e.target && e.target.classList && e.target.classList.contains("post-image")) {
    const src = e.target.getAttribute("src");
    if (src) {
      const lbImg = document.getElementById("lightbox-img");
      if (lbImg) lbImg.src = src;
      lightbox.classList.add("show");
    }
  }
});

/* close lightbox */
const lbClose = document.querySelector("#lightbox .close");
if (lbClose) lbClose.onclick = () => lightbox.classList.remove("show");

/* =====================================================
   FIREBASE DATABASE REFERENCE (Expect firebase initialized in index.html)
   ===================================================== */
const db = (typeof firebase !== "undefined" && firebase.database) ? firebase.database() : null;
if (!db) {
  console.error("Firebase Database not available. Make sure firebase scripts are loaded in index.html.");
}

/* =====================================================
   RENDER HELPERS
   Each render function creates the card DOM, wires up
   the delete button and the click-to-show-delete behaviour.
   ===================================================== */

function createDeleteButtonFor(cardEl, dbPath, key) {
  const btn = document.createElement("button");
  btn.className = "delete-btn";
  btn.textContent = "Delete";
  // default hidden (handled by CSS). We'll toggle by clicking the card.
  btn.style.display = "none";
  btn.onclick = async (e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await db.ref(`${dbPath}/${key}`).remove();
      // remove from UI
      cardEl.remove();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete: " + (err.message || err));
    }
  };
  cardEl.appendChild(btn);
  return btn;
}

/* Make clicking the card toggle the delete button visibility.
   Clicking inside inputs or other interactive elements will not toggle due to stopPropagation. */
function enableClickToToggleDelete(cardEl) {
  cardEl.addEventListener("click", (e) => {
    // if clicked a button inside card (like delete), ignore toggling
    if (e.target && e.target.tagName && (e.target.tagName.toLowerCase() === "button" || e.target.closest("button"))) {
      return;
    }
    // find the delete button
    const btn = cardEl.querySelector(".delete-btn");
    if (!btn) return;
    // toggle
    btn.style.display = (btn.style.display === "none" || btn.style.display === "") ? "block" : "none";
  });
}

/* Render announcement card */
function renderAnnouncementCard(key, data) {
  const card = document.createElement("div");
  card.className = "post";
  card.dataset.key = key;

  const title = document.createElement("h3");
  title.innerHTML = escapeHtml(data.title || "");

  const p = document.createElement("p");
  p.innerHTML = escapeHtml(data.message || "");

  card.appendChild(title);
  card.appendChild(p);

  if (data.image) {
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = data.image;
    img.alt = escapeHtml(data.title || "image");
    card.appendChild(img);
  }

  createDeleteButtonFor(card, "announcements", key);
  enableClickToToggleDelete(card);

  return card;
}

/* Render event card */
function renderEventCard(key, data) {
  const card = document.createElement("div");
  card.className = "event-card";
  card.dataset.key = key;

  const title = document.createElement("h3");
  title.innerHTML = escapeHtml(data.title || "");

  const dateP = document.createElement("p");
  dateP.innerHTML = `<strong>Date:</strong> ${escapeHtml(data.date || "")}`;

  const locP = document.createElement("p");
  locP.innerHTML = `<strong>Location:</strong> ${escapeHtml(data.location || "")}`;

  const desc = document.createElement("p");
  desc.innerHTML = escapeHtml(data.desc || data.description || "");

  card.appendChild(title);
  card.appendChild(dateP);
  card.appendChild(locP);
  card.appendChild(desc);

  if (data.image) {
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = data.image;
    img.alt = escapeHtml(data.title || "event image");
    card.appendChild(img);
  }

  createDeleteButtonFor(card, "events", key);
  enableClickToToggleDelete(card);

  return card;
}

/* Render update card */
function renderUpdateCard(key, data) {
  const card = document.createElement("div");
  card.className = "update-card";
  card.dataset.key = key;

  const p = document.createElement("p");
  p.innerHTML = escapeHtml(data.message || "");

  card.appendChild(p);

  if (data.image) {
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = data.image;
    img.alt = "update image";
    card.appendChild(img);
  }

  createDeleteButtonFor(card, "updates", key);
  enableClickToToggleDelete(card);

  return card;
}

/* Render achievement card */
function renderAchievementCard(key, data) {
  const card = document.createElement("div");
  card.className = "achievement-card";
  card.dataset.key = key;

  const title = document.createElement("h3");
  title.innerHTML = escapeHtml(data.name || data.title || "");

  const p = document.createElement("p");
  p.innerHTML = escapeHtml(data.desc || data.description || "");

  card.appendChild(title);
  card.appendChild(p);

  if (data.image) {
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = data.image;
    img.alt = escapeHtml(data.name || "achievement image");
    card.appendChild(img);
  }

  createDeleteButtonFor(card, "achievements", key);
  enableClickToToggleDelete(card);

  return card;
}

/* =====================================================
   SAVE HANDLERS (modal submit -> push to DB)
   ===================================================== */

/* Announcements */
const modalPostForm = el("modal-post-form");
if (modalPostForm) {
  modalPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = el("modal-post-title").value.trim();
    const message = el("modal-post-message").value.trim();
    const imageInput = el("modal-post-image");

    // optional: basic validation
    if (!title && !message) {
      alert("Please enter a title or message.");
      return;
    }

    const imgData = await readImageInput(imageInput);

    const newPost = {
      title,
      message,
      image: imgData || "",
      timestamp: Date.now()
    };

    // save to DB
    const ref = db.ref("announcements").push();
    await ref.set(newPost);

    // UI update handled by DB listener (below)
    hideModal(postModal);
    modalPostForm.reset();
  });
}

/* Events */
const modalEventForm = el("modal-event-form");
if (modalEventForm) {
  modalEventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = el("event-title").value.trim();
    const date = el("event-date").value;
    const location = el("event-location").value.trim();
    const desc = el("event-desc").value.trim();
    const imageInput = el("event-image");

    if (!title && !desc) {
      alert("Please enter an event title or description.");
      return;
    }

    const imgData = await readImageInput(imageInput);

    const newEvent = {
      title,
      date,
      location,
      desc,
      image: imgData || "",
      timestamp: Date.now()
    };

    const ref = db.ref("events").push();
    await ref.set(newEvent);
    hideModal(eventModal);
    modalEventForm.reset();
  });
}

/* Updates */
const modalUpdateForm = el("modal-update-form");
if (modalUpdateForm) {
  modalUpdateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = el("update-message").value.trim();
    const imageInput = el("update-image");

    if (!message) {
      alert("Enter an update message.");
      return;
    }

    const imgData = await readImageInput(imageInput);

    const newUpdate = {
      message,
      image: imgData || "",
      timestamp: Date.now()
    };

    const ref = db.ref("updates").push();
    await ref.set(newUpdate);
    hideModal(updateModal);
    modalUpdateForm.reset();
  });
}

/* Achievements */
const modalAchievementForm = el("modal-achievement-form");
if (modalAchievementForm) {
  modalAchievementForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = el("achiever-name").value.trim();
    const desc = el("achiever-desc").value.trim();
    const imageInput = el("achiever-image");

    if (!name && !desc) {
      alert("Enter name or description.");
      return;
    }

    const imgData = await readImageInput(imageInput);

    const newAchieve = {
      name,
      desc,
      image: imgData || "",
      timestamp: Date.now()
    };

    const ref = db.ref("achievements").push();
    await ref.set(newAchieve);
    hideModal(achievementModal);
    modalAchievementForm.reset();
  });
}

/* =====================================================
   LOAD DATA FROM FIREBASE (real-time listeners)
   These listeners ensure the UI always reflects database state.
   ===================================================== */

if (db) {
  // Announcements - listen for changes and re-render list
  db.ref("announcements").on("value", (snapshot) => {
    announcementsContainer.innerHTML = "";
    snapshot.forEach(child => {
      const key = child.key;
      const data = child.val() || {};
      const card = renderAnnouncementCard(key, data);
      announcementsContainer.prepend(card);
    });
  });

  // Events
  db.ref("events").on("value", (snapshot) => {
    eventsContainer.innerHTML = "";
    snapshot.forEach(child => {
      const key = child.key;
      const data = child.val() || {};
      const card = renderEventCard(key, data);
      eventsContainer.prepend(card);
    });
  });

  // Updates
  // note: some earlier code used "academicUpdates" or "updates". Use "updates".
  db.ref("updates").on("value", (snapshot) => {
    updatesContainer.innerHTML = "";
    snapshot.forEach(child => {
      const key = child.key;
      const data = child.val() || {};
      const card = renderUpdateCard(key, data);
      updatesContainer.prepend(card);
    });
  });

  // Achievements
  db.ref("achievements").on("value", (snapshot) => {
    achievementsContainer.innerHTML = "";
    snapshot.forEach(child => {
      const key = child.key;
      const data = child.val() || {};
      const card = renderAchievementCard(key, data);
      achievementsContainer.prepend(card);
    });
  });
}

/* =====================================================
   PROFILE: show logged in user info in header menu
   ===================================================== */

if (typeof firebase !== "undefined" && firebase.auth) {
  const auth = firebase.auth();

  // hide profile container initially until user logged in
  if (profileContainer) profileContainer.style.display = "none";

  auth.onAuthStateChanged((user) => {
    if (user) {
      const name = user.displayName || "User";
      const email = user.email || "";
      const photo = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B0000&color=fff`;

      // show profile UI
      if (profileContainer) profileContainer.style.display = "flex";
      if (profileAvatar) profileAvatar.src = photo;
      if (menuAvatar) menuAvatar.src = photo;
      if (menuName) menuName.textContent = name;
      if (menuEmail) menuEmail.textContent = email;
    } else {
      // signed out
      if (profileContainer) profileContainer.style.display = "none";
      if (menuName) menuName.textContent = "User";
      if (menuEmail) menuEmail.textContent = "email@example.com";
    }
  });

  // logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }).catch(err => console.error("Sign out error:", err));
    });
  }
}

/* =====================================================
   PROFILE MENU TOGGLE (click avatar to open/close)
   ===================================================== */
if (profileAvatar && profileMenu) {
  profileAvatar.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("show");
  });

  // close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target) && e.target !== profileAvatar) {
      profileMenu.classList.remove("show");
    }
  });
}

/* =====================================================
   Small helper: ensure containers exist before using them
   ===================================================== */
(function safetyCheck() {
  if (!announcementsContainer) console.warn("dynamic-posts container missing");
  if (!eventsContainer) console.warn("dynamic-events container missing");
  if (!updatesContainer) console.warn("dynamic-updates container missing");
  if (!achievementsContainer) console.warn("dynamic-achievements container missing");
})();
