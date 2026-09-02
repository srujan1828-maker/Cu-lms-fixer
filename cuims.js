const DEFAULT_SETTINGS = {
  disableAutoCuimsPopup: true,
};

let disableAutoCuimsPopup = DEFAULT_SETTINGS.disableAutoCuimsPopup;
let userOpenedPopup = false;
let resetUserOpenedTimer;

const POPUP_SELECTOR = [
  ".modal.show",
  ".modal[style*='display: block']",
  ".modal[style*='display:block']",
  "[role='dialog'][aria-modal='true']",
  ".popup.show",
  ".popup.active",
].join(", ");
const AUTO_POPUP_TEXT = /favourite teacher award|dear student,/i;
const POPUP_LAYER_NAME = /modal|popup|dialog|overlay|award|notice|message/i;

function isVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function closePopup(popup) {
  if (!isVisible(popup) || userOpenedPopup) return;

  const closeButton = popup.querySelector(
    "[data-bs-dismiss='modal'], [data-dismiss='modal'], .btn-close, .close, [aria-label='Close']",
  );
  if (closeButton instanceof HTMLElement) closeButton.click();

  // CUIMS uses more than one modal implementation; this fallback also covers
  // popups that do not expose a close control to the content script.
  popup.style.setProperty("display", "none", "important");
  popup.setAttribute("aria-hidden", "true");
  popup.classList.remove("show", "active", "in");
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.remove());
}

function closeAnnouncementPopup() {
  const matches = [...document.querySelectorAll("body *")].filter((element) => (
    AUTO_POPUP_TEXT.test(element.textContent || "") &&
    !["HTML", "BODY"].includes(element.tagName)
  ));

  for (const match of matches) {
    let layer = match;
    let bestLayer = null;

    while (layer instanceof HTMLElement && layer !== document.body) {
      const rect = layer.getBoundingClientRect();
      const style = window.getComputedStyle(layer);
      const isPopupLayer = POPUP_LAYER_NAME.test(`${layer.id} ${layer.className}`) ||
        ((style.position === "fixed" || style.position === "absolute") &&
          rect.width >= 250 && rect.height >= 80);

      if (isPopupLayer) bestLayer = layer;
      layer = layer.parentElement;
    }

    // The named wrapper is preferred. If CUIMS renders a plain announcement
    // container, its visible ancestor is still safe to hide.
    closePopup(bestLayer || match);
  }
}

function dismissAutoPopups() {
  if (!disableAutoCuimsPopup || userOpenedPopup) return;
  document.querySelectorAll(POPUP_SELECTOR).forEach(closePopup);
  closeAnnouncementPopup();
}

function noteUserPopupIntent(event) {
  if (!(event.target instanceof Element)) return;
  if (!event.target.closest("[data-bs-toggle='modal'], [data-toggle='modal'], [aria-haspopup='dialog']")) return;

  userOpenedPopup = true;
  window.clearTimeout(resetUserOpenedTimer);
  resetUserOpenedTimer = window.setTimeout(() => {
    userOpenedPopup = false;
  }, 1000);
}

document.addEventListener("click", noteUserPopupIntent, true);
document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target instanceof Element) {
    noteUserPopupIntent(event);
  }
}, true);

chrome.storage.sync.get(DEFAULT_SETTINGS).then((settings) => {
  disableAutoCuimsPopup = Boolean(settings.disableAutoCuimsPopup);
  dismissAutoPopups();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== "sync" || !changes.disableAutoCuimsPopup) return;
  disableAutoCuimsPopup = Boolean(changes.disableAutoCuimsPopup.newValue);
  dismissAutoPopups();
});

new MutationObserver(dismissAutoPopups).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "style", "aria-hidden"],
});

[100, 400, 1000, 2500].forEach((delay) => window.setTimeout(dismissAutoPopups, delay));
