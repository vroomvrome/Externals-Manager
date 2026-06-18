const trackerForm = document.getElementById("trackerForm");
const entryIdInput = document.getElementById("entryId");
const organizationInput = document.getElementById("organization");
const deadlineInput = document.getElementById("deadline");
const assignedToInput = document.getElementById("assignedTo");
const titleInput = document.getElementById("title");
const informationInput = document.getElementById("information");
const actionInput = document.getElementById("action");
const completedInput = document.getElementById("completed");
const notesInput = document.getElementById("notes");
const trackerTableBody = document.getElementById("trackerTableBody");
const trackerStatusMessage = document.getElementById("trackerStatusMessage");
const filterStatus = document.getElementById("filterStatus");
const resetFormBtn = document.getElementById("resetFormBtn");
const themeToggle = document.getElementById("themeToggle");

const TRACKER_KEY = "upbObraTrackerEntries";
const THEME_KEY = "emailGeneratorTheme";

function showTrackerStatus(message, isError = false) {
  trackerStatusMessage.textContent = message;
  trackerStatusMessage.style.color = isError ? "#dc2626" : "#15803d";

  setTimeout(() => {
    trackerStatusMessage.textContent = "";
  }, 2500);
}

function getEntries() {
  return JSON.parse(localStorage.getItem(TRACKER_KEY)) || [];
}

function saveEntries(entries) {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(entries));
}

function formatDeadline(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function resetForm() {
  trackerForm.reset();
  entryIdInput.value = "";
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

function renderEntries() {
  const entries = getEntries();
  const filter = filterStatus.value;

  let filteredEntries = entries;

  if (filter === "completed") {
    filteredEntries = entries.filter((entry) => entry.completed);
  } else if (filter === "pending") {
    filteredEntries = entries.filter((entry) => !entry.completed);
  }

  filteredEntries.sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  if (filteredEntries.length === 0) {
    trackerTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-cell">No tracker entries found.</td>
      </tr>
    `;
    return;
  }

  trackerTableBody.innerHTML = filteredEntries
    .map(
      (entry) => `
        <tr>
          <td>
            <span class="status-badge ${entry.completed ? "status-completed" : "status-pending"}">
              ${entry.completed ? "Completed" : "Pending"}
            </span>
          </td>
          <td>${entry.organization || "-"}</td>
          <td>${formatDeadline(entry.deadline)}</td>
          <td>${entry.assignedTo || "-"}</td>
          <td>${entry.title || "-"}</td>
          <td>${entry.action || "-"}</td>
          <td>${entry.notes || "-"}</td>
          <td>
            <div class="table-actions">
              <button class="secondary-btn small-btn edit-btn" data-id="${entry.id}">Edit</button>
              <button class="primary-btn small-btn toggle-btn" data-id="${entry.id}">
                ${entry.completed ? "Mark Pending" : "Mark Done"}
              </button>
              <button class="danger-btn small-btn delete-btn" data-id="${entry.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  bindTableActions();
}

function bindTableActions() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => editEntry(button.dataset.id));
  });

  document.querySelectorAll(".toggle-btn").forEach((button) => {
    button.addEventListener("click", () => toggleEntryStatus(button.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => deleteEntry(button.dataset.id));
  });
}

function editEntry(id) {
  const entries = getEntries();
  const entry = entries.find((item) => item.id === id);

  if (!entry) return;

  entryIdInput.value = entry.id;
  organizationInput.value = entry.organization;
  deadlineInput.value = entry.deadline;
  assignedToInput.value = entry.assignedTo;
  titleInput.value = entry.title;
  informationInput.value = entry.information;
  actionInput.value = entry.action;
  completedInput.checked = entry.completed;
  notesInput.value = entry.notes;

  window.scrollTo({ top: 0, behavior: "smooth" });
  showTrackerStatus("Entry loaded for editing.");
}

function toggleEntryStatus(id) {
  const entries = getEntries().map((entry) =>
    entry.id === id ? { ...entry, completed: !entry.completed } : entry
  );

  saveEntries(entries);
  renderEntries();
  showTrackerStatus("Entry status updated.");
}

function deleteEntry(id) {
  const confirmed = confirm("Delete this tracker entry?");
  if (!confirmed) return;

  const entries = getEntries().filter((entry) => entry.id !== id);
  saveEntries(entries);
  renderEntries();
  showTrackerStatus("Entry deleted.");
}

function handleSubmit(event) {
  event.preventDefault();

  const organization = organizationInput.value.trim();
  const deadline = deadlineInput.value;
  const assignedTo = assignedToInput.value.trim();
  const title = titleInput.value.trim();
  const information = informationInput.value.trim();
  const action = actionInput.value;
  const completed = completedInput.checked;
  const notes = notesInput.value.trim();
  const entryId = entryIdInput.value;

  if (!organization) {
    showTrackerStatus("Organization / Partnership is required.", true);
    return;
  }

  const entries = getEntries();

  const newEntry = {
    id: entryId || generateId(),
    organization,
    deadline,
    assignedTo,
    title,
    information,
    action,
    completed,
    notes,
    createdAt: new Date().toISOString()
  };

  let updatedEntries;

  if (entryId) {
    updatedEntries = entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...newEntry } : entry
    );
    showTrackerStatus("Entry updated.");
  } else {
    updatedEntries = [newEntry, ...entries];
    showTrackerStatus("Entry added.");
  }

  saveEntries(updatedEntries);
  renderEntries();
  resetForm();
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

trackerForm.addEventListener("submit", handleSubmit);
filterStatus.addEventListener("change", renderEntries);
resetFormBtn.addEventListener("click", resetForm);
themeToggle.addEventListener("click", toggleTheme);

loadTheme();
renderEntries();
