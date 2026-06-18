const orgNameInput = document.getElementById("orgName");
const eventNameInput = document.getElementById("eventName");
const generatedEmail = document.getElementById("generatedEmail");

const acceptBtn = document.getElementById("acceptBtn");
const rejectBtn = document.getElementById("rejectBtn");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const themeToggle = document.getElementById("themeToggle");
const statusMessage = document.getElementById("statusMessage");

const acceptTemplateInput = document.getElementById("acceptTemplate");
const rejectTemplateInput = document.getElementById("rejectTemplate");
const saveTemplatesBtn = document.getElementById("saveTemplatesBtn");
const resetTemplatesBtn = document.getElementById("resetTemplatesBtn");

const HISTORY_KEY = "emailGeneratorHistory";
const THEME_KEY = "emailGeneratorTheme";
const TEMPLATE_KEY = "emailGeneratorTemplates";

const defaultTemplates = {
  accept: `Good day, {organization}!

We hope this message finds you well. We are writing to formally inform you that UPB Obra accepts your partnership offer for {event} and is enthusiastic to collaborate with {organization} for the event.

After thorough consideration and evaluation of the partnership terms outlined in your proposal, we are convinced that this partnership aligns with UPB Obra's NSMOC (nationalist, scientific, mass-oriented, and creative) principles and its goal to achieve an NSMOC culture. For that reason, we are keen to uphold the values that {organization} and {event} represent and are therefore eager to extend the needed assistance to yield outstanding results for the event.

To kickstart the collaboration, we would appreciate it if you could provide UPB Obra with additional details for the next steps of this partnership.

Please do not hesitate to reach out to Jerome Alberto (facebook.com/jerome.alberto.18), our Vice Chairperson for External Affairs, or email us at upb.obra@gmail.com if you have any questions or require further clarification on any matter related to this collaboration.

Once again, thank you and we look forward to a fruitful partnership with {organization}.

Padayon!

Lente ng Masa,
UPB Obra`,

  reject: `Good day, {organization}!

We hope this message finds you well. First and foremost, UPB Obra would like to express its gratitude for your interest in exploring a partnership with the organization for {event}. We genuinely appreciate your time and effort in discussing potential partnerships with us.

After careful and thorough evaluation of our current goals and resources, we regret to inform you that we have decided not to move forward with the proposed partnership at this time due to UPB Obra's existing projects, commitments, and current limitations in capacity.

Despite our decision, we welcome future proposals and remain open to exploring potential partnerships with {organization}.

Please do not hesitate to reach out to Jerome Alberto (facebook.com/jerome.alberto.18), our Vice Chairperson for External Affairs, or email us at upb.obra@gmail.com if you have any questions or require further clarification on any matter related to this collaboration.

Thank you once again for your partnership proposal. We appreciate your understanding and wish you all the best in your future endeavors.

Padayon!

Lente ng Masa,
UPB Obra`
};

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#dc2626" : "#15803d";

  setTimeout(() => {
    statusMessage.textContent = "";
  }, 2500);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function getTemplates() {
  const saved = localStorage.getItem(TEMPLATE_KEY);

  if (!saved) {
    return { ...defaultTemplates };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      accept: parsed.accept || defaultTemplates.accept,
      reject: parsed.reject || defaultTemplates.reject
    };
  } catch {
    return { ...defaultTemplates };
  }
}

function saveTemplates(templates) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
}

function loadTemplatesIntoEditor() {
  const templates = getTemplates();
  acceptTemplateInput.value = templates.accept;
  rejectTemplateInput.value = templates.reject;
}

function saveTemplateChanges() {
  const accept = acceptTemplateInput.value.trim();
  const reject = rejectTemplateInput.value.trim();

  if (!accept || !reject) {
    showStatus("Both templates must have content.", true);
    return;
  }

  saveTemplates({ accept, reject });
  showStatus("Templates saved.");
}

function resetTemplates() {
  const confirmed = confirm("Reset both templates to default?");
  if (!confirmed) return;

  saveTemplates({ ...defaultTemplates });
  loadTemplatesIntoEditor();
  showStatus("Templates reset to default.");
}

function fillTemplate(template, data) {
  return template
    .replaceAll("{organization}", data.organization)
    .replaceAll("{event}", data.event);
}

function generateEmail(type) {
  const organization = orgNameInput.value.trim();
  const event = eventNameInput.value.trim();

  if (!organization || !event) {
    showStatus("Please fill in both organization name and event name.", true);
    return;
  }

  const templates = getTemplates();
  const selectedTemplate = type === "accept" ? templates.accept : templates.reject;

  const result = fillTemplate(selectedTemplate, {
    organization,
    event
  });

  generatedEmail.value = result;
  generatedEmail.dataset.responseType = type;
  showStatus("Email generated.");
}

function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = `<p class="empty-text">No saved emails yet.</p>`;
    return;
  }

  historyList.innerHTML = history
    .map(
      (item, index) => `
        <div class="history-item" data-index="${index}">
          <div class="history-title">${item.organization} - ${item.event}</div>
          <div class="history-meta">${item.type.toUpperCase()} | ${formatDate(item.createdAt)}</div>
        </div>
      `
    )
    .join("");

  document.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = item.dataset.index;
      const selected = history[index];

      orgNameInput.value = selected.organization;
      eventNameInput.value = selected.event;
      generatedEmail.value = selected.email;
      generatedEmail.dataset.responseType = selected.type;
      showStatus("History item loaded.");
    });
  });
}

function saveCurrentEmail() {
  const organization = orgNameInput.value.trim();
  const event = eventNameInput.value.trim();
  const emailText = generatedEmail.value.trim();
  const responseType = generatedEmail.dataset.responseType || "custom";

  if (!organization || !event || !emailText) {
    showStatus("Generate or write an email first before saving.", true);
    return;
  }

  const history = getHistory();

  history.unshift({
    organization,
    event,
    email: emailText,
    type: responseType,
    createdAt: new Date().toISOString()
  });

  saveHistory(history);
  renderHistory();
  showStatus("Email saved to history.");
}

async function copyEmail() {
  const emailText = generatedEmail.value.trim();

  if (!emailText) {
    showStatus("Nothing to copy yet.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(emailText);
    showStatus("Email copied to clipboard.");
  } catch (error) {
    showStatus("Copy failed. Please copy manually.", true);
  }
}

function clearHistory() {
  const confirmed = confirm("Are you sure you want to clear all saved history?");
  if (!confirmed) return;

  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  showStatus("History cleared.");
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

acceptBtn.addEventListener("click", () => generateEmail("accept"));
rejectBtn.addEventListener("click", () => generateEmail("reject"));
copyBtn.addEventListener("click", copyEmail);
saveBtn.addEventListener("click", saveCurrentEmail);
clearHistoryBtn.addEventListener("click", clearHistory);
themeToggle.addEventListener("click", toggleTheme);
saveTemplatesBtn.addEventListener("click", saveTemplateChanges);
resetTemplatesBtn.addEventListener("click", resetTemplates);

loadTheme();
loadTemplatesIntoEditor();
renderHistory();
