/**
 * Lifegate / TBI – Invitation Feedback Form
 * Vanilla JavaScript – Form Logic, Validation & Submission
 */

// ===== CONFIGURATION =====
// After deploying your Google Apps Script, paste the Web App URL here:
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_jSeQ_0jXT8NKWjQYg7EgzKVEZ4dWW7d4QimCzmt4ay2zqqsGkzAkvfSr5vE_zlSr/exec";

// ===== STATE =====
let speakerCount = 0;

// ===== DOM REFERENCES =====
const form            = document.getElementById("feedbackForm");
const addSpeakerBtn   = document.getElementById("addSpeakerBtn");
const speakersContainer = document.getElementById("speakersContainer");
const submitBtn       = document.getElementById("submitBtn");
const btnSpinner      = document.getElementById("btnSpinner");
const successMessage  = document.getElementById("successMessage");
const resetBtn        = document.getElementById("resetBtn");
const mapUpload       = document.getElementById("mapUpload");
const fileDisplay     = document.getElementById("fileDisplay");

// ===== REQUIRED FIELDS (id → error message) =====
const REQUIRED = {
  meetingDate:     "Please select the meeting date.",
  meetingTheme:    "Please enter the meeting theme.",
  location:        "Please enter the location.",
  directions:      "Please provide detailed directions.",
  startTime:       "Please enter the meeting start time.",
  duration:        "Please enter the meeting duration.",
  sessionStart:    "Please enter the session start time.",
  sessionDuration: "Please enter the session duration.",
  expectations:    "Please describe session expectations.",
  logistics:       "Please detail the logistics information.",
  phone1:          "Please enter at least one phone number.",
  emailContact:    "Please enter a valid email address.",
  signature:       "Please type your full name as signature.",
  signDate:        "Please select the confirmation date.",
};

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  addSpeaker(); // Start with one speaker row
  bindEvents();
  prefillTodayDate();
});

function prefillTodayDate() {
  // Pre-fill confirmation date with today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("signDate").value = today;
}

// ===== EVENT BINDINGS =====
function bindEvents() {
  addSpeakerBtn.addEventListener("click", addSpeaker);
  form.addEventListener("submit", handleSubmit);
  resetBtn.addEventListener("click", resetForm);
  mapUpload.addEventListener("change", handleFileChange);

  // Live-clear field errors on input
  Object.keys(REQUIRED).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => clearError(id));
      el.addEventListener("change", () => clearError(id));
    }
  });

  // Checkbox live-clear
  const confirmChk = document.getElementById("confirmAccuracy");
  confirmChk.addEventListener("change", () => clearError("confirmAccuracy"));
}

// ===== FILE DISPLAY =====
function handleFileChange(e) {
  const file = e.target.files[0];
  fileDisplay.textContent = file ? `📎 ${file.name}` : "No file selected";
}

// ===== SPEAKER MANAGEMENT =====
function addSpeaker() {
  speakerCount++;
  const row = document.createElement("div");
  row.className = "speaker-row";
  row.dataset.id = speakerCount;

  row.innerHTML = `
    <div class="speaker-num">Speaker ${speakerCount}</div>
    <div class="speaker-field">
      <label for="speakerName${speakerCount}">Full Name</label>
      <input type="text" id="speakerName${speakerCount}" class="speaker-name" placeholder="Pastor / Apostle name" />
    </div>
    <div class="speaker-field">
      <label for="speakerBg${speakerCount}">Background / Church</label>
      <input type="text" id="speakerBg${speakerCount}" class="speaker-bg" placeholder="Ministry or denomination" />
    </div>
    <button type="button" class="btn-remove" aria-label="Remove speaker ${speakerCount}" onclick="removeSpeaker(this)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  speakersContainer.appendChild(row);

  // Focus on newly added name field
  row.querySelector(".speaker-name").focus();

  updateSpeakerNumbers();
}

function removeSpeaker(btn) {
  const row = btn.closest(".speaker-row");
  if (speakersContainer.children.length <= 1) {
    // Clear instead of removing last row
    row.querySelectorAll("input").forEach(i => i.value = "");
    return;
  }
  row.style.opacity = "0";
  row.style.transform = "translateX(-12px)";
  row.style.transition = "opacity 0.25s, transform 0.25s";
  setTimeout(() => {
    row.remove();
    updateSpeakerNumbers();
  }, 250);
}

function updateSpeakerNumbers() {
  const rows = speakersContainer.querySelectorAll(".speaker-row");
  rows.forEach((row, idx) => {
    const numEl = row.querySelector(".speaker-num");
    if (numEl) numEl.textContent = `Speaker ${idx + 1}`;
  });
}

function getSpeakersString() {
  const rows = speakersContainer.querySelectorAll(".speaker-row");
  const entries = [];
  rows.forEach((row, idx) => {
    const name = row.querySelector(".speaker-name")?.value.trim() || "";
    const bg   = row.querySelector(".speaker-bg")?.value.trim() || "";
    if (name || bg) {
      entries.push(`Speaker ${idx + 1}: ${name}${bg ? " — " + bg : ""}`);
    }
  });
  return entries.join(" | ");
}

// ===== VALIDATION =====
function validateForm() {
  let valid = true;

  // Clear all errors
  document.querySelectorAll(".field-error").forEach(e => e.textContent = "");
  document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("has-error"));

  // Required fields
  Object.entries(REQUIRED).forEach(([id, msg]) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (el.type === "checkbox") {
      if (!el.checked) {
        showError(id, "Please confirm accuracy of information.");
        valid = false;
      }
    } else {
      const value = el.value.trim();
      if (!value) {
        showError(id, msg);
        valid = false;
      } else if (id === "emailContact" && !isValidEmail(value)) {
        showError(id, "Please enter a valid email address.");
        valid = false;
      }
    }
  });

  return valid;
}

function showError(id, msg) {
  const errEl = document.getElementById(`err-${id}`);
  const inputEl = document.getElementById(id);
  if (errEl) errEl.textContent = msg;
  if (inputEl) inputEl.classList.add("has-error");
}

function clearError(id) {
  const errEl = document.getElementById(`err-${id}`);
  const inputEl = document.getElementById(id);
  if (errEl) errEl.textContent = "";
  if (inputEl) inputEl.classList.remove("has-error");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== COLLECT FORM DATA =====
function collectFormData() {
  const v = id => document.getElementById(id)?.value.trim() || "";

  return {
    meetingDate:     v("meetingDate"),
    theme:           v("meetingTheme"),
    location:        v("location"),
    directions:      v("directions"),
    startTime:       v("startTime"),
    duration:        v("duration"),
    sessionStart:    v("sessionStart"),
    sessionDuration: v("sessionDuration"),
    speakers:        getSpeakersString(),
    expectations:    v("expectations"),
    logistics:       v("logistics"),
    notes:           v("additionalNotes"),
    phone1:          v("phone1"),
    phone2:          v("phone2"),
    email:           v("emailContact"),
    signature:       v("signature"),
    submissionDate:  new Date().toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" }),
  };
}

// ===== FORM SUBMISSION =====
async function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    // Scroll to first error
    const firstError = document.querySelector(".has-error");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // Check URL configured
  if (SCRIPT_URL === "PASTE_WEB_APP_URL_HERE") {
    showDemoSuccess();
    return;
  }

  setLoading(true);

  try {
    const data = collectFormData();

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // no-cors means we won't get a readable response, so treat as success
    showSuccess();
  } catch (err) {
    console.error("Submission error:", err);
    alert("An error occurred while submitting the form. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
}

function setLoading(state) {
  submitBtn.disabled = state;
  document.querySelector(".btn-text").style.opacity = state ? "0.6" : "1";
  btnSpinner.classList.toggle("visible", state);
}

function showSuccess() {
  form.style.display = "none";
  successMessage.classList.add("visible");
  successMessage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showDemoSuccess() {
  // For testing without Google Sheets integration
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    showSuccess();
  }, 1500);
}

function resetForm() {
  form.reset();
  form.style.display = "block";
  successMessage.classList.remove("visible");

  // Clear speakers and add fresh row
  speakersContainer.innerHTML = "";
  speakerCount = 0;
  addSpeaker();

  // Reset file display
  fileDisplay.textContent = "No file selected";

  // Prefill date again
  prefillTodayDate();

  // Clear all errors
  document.querySelectorAll(".field-error").forEach(e => e.textContent = "");
  document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("has-error"));

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}
