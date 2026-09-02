const RESOURCE_SELECTOR = 'a[href*="/mod/resource/view.php?id="]';
const PAGE_SELECTOR = 'a[href*="/mod/page/view.php?id="]';
const BUTTON_CLASS = "cu-lms-download-button";
const COPY_BUTTON_CLASS = "cu-lms-copy-button";

const DEFAULT_SETTINGS = {
  enableDownloadButton: true,
  enableCopyButton: true,
  hideSopPermanently: false,
  disableAutoSopPopup: true,
};

let currentSettings = { ...DEFAULT_SETTINGS };
let userOpenedAiPopup = false;

function isLmsResource(link) {
  try {
    const url = new URL(link.href);
    return url.origin === location.origin &&
      url.pathname === "/mod/resource/view.php" &&
      /^\d+$/.test(url.searchParams.get("id") || "");
  } catch {
    return false;
  }
}

function isLmsPage(link) {
  try {
    const url = new URL(link.href);
    return url.origin === location.origin &&
      url.pathname === "/mod/page/view.php" &&
      /^\d+$/.test(url.searchParams.get("id") || "");
  } catch {
    return false;
  }
}

function resourceRow(link) {
  return link.closest('[data-region="activity-card"], .activity-item');
}

function safeFilename(filename) {
  return filename
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 180);
}

async function originalFile(resourceUrl) {
  const response = await fetch(resourceUrl, { credentials: "include" });
  if (!response.ok) throw new Error(`CU LMS returned ${response.status}`);

  const page = new DOMParser().parseFromString(await response.text(), "text/html");
  const original = [...page.querySelectorAll('a[download][href]')].find((anchor) => {
    const url = new URL(anchor.href, resourceUrl);
    return url.origin === location.origin &&
      /^\/pluginfile\.php\/.+\/mod_resource\/content\/\d+\//.test(url.pathname);
  });
  if (!original) throw new Error("Original file link was not found on this LMS page.");

  const fileUrl = new URL(original.href, resourceUrl).href;
  const filename = safeFilename(
    original.getAttribute("download") ||
    decodeURIComponent(new URL(fileUrl).pathname.split("/").pop() || "download"),
  );
  if (!filename) throw new Error("The original file does not have a valid name.");
  return { fileUrl, filename };
}

function readableText(pageHtml) {
  const page = new DOMParser().parseFromString(pageHtml, "text/html");
  const content = page.querySelector("#region-main");
  if (!content) throw new Error("The reading material content was not found.");

  content.querySelectorAll(
    "script, style, noscript, iframe, .activity-header, .completion-info, [data-region='activity-information']",
  ).forEach((element) => element.remove());

  const text = content.textContent
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  if (!text) throw new Error("This reading material does not contain copyable text.");
  return text;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Chrome blocked clipboard access. Try the button again.");
  }
}

function addButton(link) {
  if (!currentSettings.enableDownloadButton || !isLmsResource(link)) return;

  const row = resourceRow(link);
  if (!row || row.querySelector(`.${BUTTON_CLASS}`)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;
  button.textContent = "Download";
  button.title = `Download ${link.textContent.trim().replace(/\s+File$/, "")}`;
  button.setAttribute("aria-label", button.title);

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const originalLabel = "Download";
    button.disabled = true;
    button.textContent = "Starting…";

    try {
      const { fileUrl, filename } = await originalFile(link.href);
      chrome.runtime.sendMessage(
        { type: "download-file", resourceUrl: link.href, fileUrl, filename },
        (result) => {
          if (chrome.runtime.lastError || !result?.ok) {
            button.textContent = "Try again";
            button.title = result?.error || "Could not start download. Try again.";
          } else {
            button.textContent = "Queued";
            button.title = "Download queued in Chrome";
          }
          button.disabled = false;
          window.setTimeout(() => {
            button.textContent = originalLabel;
            button.title = `Download ${link.textContent.trim().replace(/\s+File$/, "")}`;
          }, 2200);
        },
      );
    } catch (error) {
      button.textContent = "Try again";
      button.title = error instanceof Error ? error.message : "Could not find the original file.";
      button.disabled = false;
      window.setTimeout(() => {
        button.textContent = originalLabel;
        button.title = `Download ${link.textContent.trim().replace(/\s+File$/, "")}`;
      }, 3500);
    }
  }, true);

  const target = row.querySelector(".activity-name-area") || row;
  target.append(button);
}

function addCopyButton(link) {
  if (!currentSettings.enableCopyButton || !isLmsPage(link)) return;

  const row = resourceRow(link);
  if (!row || row.querySelector(`.${COPY_BUTTON_CLASS}`)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = COPY_BUTTON_CLASS;
  button.textContent = "Copy content";
  button.title = `Copy the text from ${link.textContent.trim().replace(/\s+Page$/, "")}`;
  button.setAttribute("aria-label", button.title);

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    button.disabled = true;
    button.textContent = "Copying…";

    try {
      const response = await fetch(link.href, { credentials: "include" });
      if (!response.ok) throw new Error(`CU LMS returned ${response.status}`);
      await copyText(readableText(await response.text()));
      button.textContent = "Copied";
      button.title = "Reading material copied to your clipboard";
    } catch (error) {
      button.textContent = "Try again";
      button.title = error instanceof Error ? error.message : "Could not copy this reading material.";
    }

    button.disabled = false;
    window.setTimeout(() => {
      button.textContent = "Copy content";
      button.title = `Copy the text from ${link.textContent.trim().replace(/\s+Page$/, "")}`;
    }, 2500);
  }, true);

  const target = row.querySelector(".activity-name-area") || row;
  target.append(button);
}

// Track explicit user interactions with the AI tools buttons / panel
window.addEventListener(
  "click",
  (event) => {
    if (
      event.target.closest(
        "#ai-lib-close, .ai-lib-icon-btn[aria-label='Close'], .ai-lib-icon-btn[title='Close']",
      )
    ) {
      userOpenedAiPopup = false;
    } else if (
      event.target.closest(
        "#ai-lib-fab, .ai-lib-fab, [aria-controls='ai-lib-panel'], #ai-lib-panel, .ai-lib-panel, [data-lib-url], [data-lib-id]",
      )
    ) {
      userOpenedAiPopup = true;
    }
  },
  true,
);

window.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter" || event.key === " ") {
      if (
        event.target.closest(
          "#ai-lib-fab, .ai-lib-fab, [aria-controls='ai-lib-panel']",
        )
      ) {
        userOpenedAiPopup = true;
      }
    }
  },
  true,
);

function dismissAiPopup(force = false) {
  // If user opened it manually and we are not forcing permanent hide, do not auto-close
  if (userOpenedAiPopup && !force) return;

  const panel =
    document.getElementById("ai-lib-panel") ||
    document.querySelector(".ai-lib-panel");
  if (!panel) return;

  const isVisible =
    panel.style.display === "flex" ||
    (panel.style.display !== "none" &&
      panel.style.display !== "" &&
      window.getComputedStyle(panel).display !== "none");

  // If the panel is already hidden, do NOT dispatch any synthetic clicks
  if (!isVisible) {
    if (force) {
      panel.style.display = "none";
      const fab =
        document.getElementById("ai-lib-fab") ||
        document.querySelector(".ai-lib-fab");
      if (fab) fab.style.display = "none";
    }
    return;
  }

  // 1. Mark 'Don't auto-open again' checkbox so LMS persists preference
  const dontShow =
    document.getElementById("ai-lib-dontshow") ||
    panel.querySelector(".ai-lib-dontshow-cb");
  if (dontShow && !dontShow.checked) {
    dontShow.checked = true;
    dontShow.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // 2. Trigger the LMS close button once
  const closeBtn = document.getElementById("ai-lib-close");
  if (closeBtn) {
    closeBtn.click();
  }

  // 3. Fallback: enforce hidden state directly
  panel.style.display = "none";

  // 4. Update the floating action button active state
  const fab =
    document.getElementById("ai-lib-fab") ||
    document.querySelector(".ai-lib-fab");
  if (fab) {
    fab.classList.remove("ai-lib-fab--active");
    fab.setAttribute("aria-expanded", "false");
    if (force) {
      fab.style.display = "none";
    }
  }
}


function scan() {
  if (currentSettings.hideSopPermanently) {
    dismissAiPopup(true);
  } else if (currentSettings.disableAutoSopPopup) {
    dismissAiPopup(false);
  }

  if (currentSettings.enableDownloadButton) {
    document.querySelectorAll(RESOURCE_SELECTOR).forEach(addButton);
  }

  if (currentSettings.enableCopyButton) {
    document.querySelectorAll(PAGE_SELECTOR).forEach(addCopyButton);
  }
}

function applySettings() {
  if (currentSettings.hideSopPermanently) {
    document.documentElement.setAttribute("data-cu-hide-sop-permanently", "true");
    const panel = document.getElementById("ai-lib-panel") || document.querySelector(".ai-lib-panel");
    if (panel) panel.style.display = "none";
    const fab = document.getElementById("ai-lib-fab") || document.querySelector(".ai-lib-fab");
    if (fab) fab.style.display = "none";
  } else {
    document.documentElement.removeAttribute("data-cu-hide-sop-permanently");
    const fab = document.getElementById("ai-lib-fab") || document.querySelector(".ai-lib-fab");
    if (fab && fab.style.display === "none") {
      fab.style.display = "";
    }
  }

  if (!currentSettings.enableDownloadButton) {
    document.querySelectorAll(`.${BUTTON_CLASS}`).forEach((btn) => btn.remove());
  }

  if (!currentSettings.enableCopyButton) {
    document.querySelectorAll(`.${COPY_BUTTON_CLASS}`).forEach((btn) => btn.remove());
  }

  scan();
}

async function loadSettings() {
  try {
    const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  } catch (error) {
    console.error("CU LMS extension could not load settings:", error);
  }
  applySettings();
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== "sync") return;
  for (const [key, change] of Object.entries(changes)) {
    currentSettings[key] = change.newValue;
  }
  applySettings();
});

// Initialize on page load
loadSettings();

new MutationObserver(scan).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// Periodic checks for delayed LMS auto-open scripts during page initialization
[150, 400, 900, 1800, 3000].forEach((delay) => {
  window.setTimeout(() => {
    if (currentSettings.hideSopPermanently) {
      dismissAiPopup(true);
    } else if (currentSettings.disableAutoSopPopup) {
      dismissAiPopup(false);
    }
  }, delay);
});
