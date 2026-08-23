const DEFAULT_SETTINGS = {
  enableDownloadButton: true,
  enableCopyButton: true,
  hideSopPermanently: false,
  disableAutoSopPopup: true,
};

const elements = {
  enableDownloadButton: document.getElementById("enableDownloadButton"),
  enableCopyButton: document.getElementById("enableCopyButton"),
  hideSopPermanently: document.getElementById("hideSopPermanently"),
  disableAutoSopPopup: document.getElementById("disableAutoSopPopup"),
  saveStatus: document.getElementById("saveStatus"),
  githubLink: document.getElementById("githubLink"),
};

let saveTimeout = null;

function showSaved() {
  if (!elements.saveStatus) return;
  elements.saveStatus.classList.add("visible");
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    elements.saveStatus.classList.remove("visible");
  }, 1500);
}

async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  elements.enableDownloadButton.checked = Boolean(settings.enableDownloadButton);
  elements.enableCopyButton.checked = Boolean(settings.enableCopyButton);
  elements.hideSopPermanently.checked = Boolean(settings.hideSopPermanently);
  elements.disableAutoSopPopup.checked = Boolean(settings.disableAutoSopPopup);
}

async function saveSettings() {
  const settings = {
    enableDownloadButton: elements.enableDownloadButton.checked,
    enableCopyButton: elements.enableCopyButton.checked,
    hideSopPermanently: elements.hideSopPermanently.checked,
    disableAutoSopPopup: elements.disableAutoSopPopup.checked,
  };

  await chrome.storage.sync.set(settings);
  showSaved();
}

function initListeners() {
  // Ensure mutual exclusivity between permanent hide and only auto-disable
  elements.hideSopPermanently.addEventListener("change", () => {
    if (elements.hideSopPermanently.checked) {
      elements.disableAutoSopPopup.checked = false;
    }
    saveSettings();
  });

  elements.disableAutoSopPopup.addEventListener("change", () => {
    if (elements.disableAutoSopPopup.checked) {
      elements.hideSopPermanently.checked = false;
    }
    saveSettings();
  });

  elements.enableDownloadButton.addEventListener("change", saveSettings);
  elements.enableCopyButton.addEventListener("change", saveSettings);

  if (elements.githubLink) {
    elements.githubLink.addEventListener("click", (event) => {
      event.preventDefault();
      chrome.tabs.create({ url: elements.githubLink.href });
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  initListeners();
});
