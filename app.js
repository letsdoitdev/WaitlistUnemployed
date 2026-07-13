/* ============================================================
   SUPABASE CONFIG — PASTE YOUR VALUES HERE
   Find both in your Supabase dashboard:
   Project Settings -> API -> Project URL + anon public key
   ============================================================ */
const SUPABASE_URL = "https://oobzltpvehifjlxolpjd.supabase.co"; // <-- replace
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYnpsdHB2ZWhpZmpseG9scGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MDA4MzgsImV4cCI6MjA5OTQ3NjgzOH0.-vS-9Zg8f-7LjEJua2YqyUzUtEzhpNWDDYF0voe5mSA";          // <-- replace
/* ============================================================ */

const form = document.getElementById("waitlist-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const honeypot = document.getElementById("website");
const button = document.getElementById("submit-btn");
const msg = document.getElementById("form-msg");
const successBox = document.getElementById("success");
const successLine = document.getElementById("success-line");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY = {
  nameMissing: "we can't put \"blank\" on the guest list. name, please.",
  emailMissing: "no email, no portal. those are the rules.",
  emailInvalid: "that email is not real. we checked.",
  serverError: "the server fumbled. hit the button again — the quest demands it.",
  duplicate: "you're already on the list. signing up twice doesn't get you in faster. respect the hustle though.",
};

function setLoading(loading) {
  button.disabled = loading;
  button.textContent = loading ? "summoning..." : "claim my spot";
}

function showError(text, badInput) {
  msg.textContent = text;
  if (badInput) {
    badInput.classList.add("invalid");
    badInput.focus();
  }
}

function clearErrors() {
  msg.textContent = "";
  nameInput.classList.remove("invalid");
  emailInput.classList.remove("invalid");
}

function showSuccess(line) {
  if (line) successLine.textContent = line;
  form.hidden = true;
  successBox.hidden = false;
}

async function joinWaitlist(name, email) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ name, email }),
  });
  return res;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  // honeypot tripped: pretend everything is fine, send nothing
  if (honeypot.value.trim() !== "") {
    showSuccess();
    return;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();

  if (!name) {
    showError(COPY.nameMissing, nameInput);
    return;
  }
  if (!email) {
    showError(COPY.emailMissing, emailInput);
    return;
  }
  if (!EMAIL_RE.test(email)) {
    showError(COPY.emailInvalid, emailInput);
    return;
  }

  setLoading(true);
  try {
    const res = await joinWaitlist(name, email);

    if (res.ok) {
      showSuccess();
    } else if (res.status === 409) {
      // unique violation: they're already in. that's a win, not an error.
      showSuccess(COPY.duplicate);
    } else {
      showError(COPY.serverError);
      setLoading(false);
    }
  } catch (err) {
    showError(COPY.serverError);
    setLoading(false);
  }
});

nameInput.addEventListener("input", () => nameInput.classList.remove("invalid"));
emailInput.addEventListener("input", () => emailInput.classList.remove("invalid"));
