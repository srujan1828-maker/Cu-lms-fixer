const RESOURCE_URL = /^https:\/\/lms\.cuchd\.in\/mod\/resource\/view\.php\?id=\d+(?:&.*)?$/;
const FILE_URL = /^https:\/\/lms\.cuchd\.in\/pluginfile\.php\/.+\/mod_resource\/content\/\d+\/.+$/;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (
    message?.type !== "download-file" ||
    !RESOURCE_URL.test(message.resourceUrl || "") ||
    !FILE_URL.test(message.fileUrl || "")
  ) {
    sendResponse({ ok: false, error: "The LMS did not provide a valid original-file link." });
    return;
  }

  chrome.downloads.download(
    {
      url: message.fileUrl,
      filename: message.filename || undefined,
      conflictAction: "uniquify",
      saveAs: false,
    },
    (downloadId) => {
      const error = chrome.runtime.lastError;
      if (error) {
        sendResponse({ ok: false, error: error.message });
      } else {
        sendResponse({ ok: true, downloadId });
      }
    },
  );

  return true;
});
