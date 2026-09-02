# CU LMS Fixer & Downloader 🚀

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Target](https://img.shields.io/badge/Target-lms.cuchd.in-red.svg)](https://lms.cuchd.in)
[![GitHub Repo](https://img.shields.io/badge/GitHub-ankitpandeynine%2FCu--lms--fixer-blue.svg)](https://github.com/ankitpandeynine/Cu-lms-fixer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A powerful, lightweight Chrome extension designed for students and educators using the **Chandigarh University LMS** (`https://lms.cuchd.in`). It streamlines course navigation, adds one-click file attachments download, enables instant reading material copying, and gives you total control over intrusive AI popups.

---

## ✨ Features

### 1. 📥 One-Click File Downloads
- Adds a clean red **Download** button directly under each file resource topic card (`/mod/resource/view.php`).
- Bypasses intermediate preview HTML pages.
- Resolves and fetches Moodle's true `/pluginfile.php/...` attachment link.
- Downloads files directly with their original attachment filenames (e.g. `Unit-1 Lecture.pptx`) via Chrome's native download manager.

### 2. 📋 One-Click Reading Material Copier
- Adds a **Copy content** button to Moodle Page activities (`/mod/page/view.php`).
- Strips navigation headers, scripts, embedded video wrappers, and completion checkboxes.
- Formats the clean text and copies it straight to your clipboard with instant visual confirmation.

### 3. 🚫 Smart AI / SOP Popup Controller
- **Only disable auto SOP popup** *(Default)*: Automatically suppresses the intrusive **CU-LMS AI Tools — All Guides** popup (`#ai-lib-panel`) from popping up automatically on page load, while keeping the blue **ALL SOPS** button visible so you can still open guides when desired.
- **Hide and disable SOP popup (permanently)**: Completely suppresses the dialog and hides the floating **ALL SOPS** button from the page entirely.
- **Zero interference**: Carefully isolated so Moodle's native **Notification popover**, **Message drawer**, and **My Learning** menus continue to work flawlessly.

### 4. 🚫 Automatic CUIMS Popup Disabler
- **Disable automatic CUIMS popups** *(Default)*: Closes automatically displayed dialogs on the CUIMS Student Home page, including Bootstrap-style modal popups.
- **Manual dialogs remain available**: Dialogs opened through a CUIMS button are left alone, so normal workflows still work.

### 5. ⚙️ Interactive GUI Settings Popup
- Click the extension icon in your Chrome toolbar to toggle any feature on or off.
- Settings are saved in `chrome.storage.sync` and applied **live in real-time** across all open CU LMS tabs without requiring a page refresh.

---

## 🛠️ Installation Guide

### Prerequisites
- Google Chrome, Brave, Microsoft Edge, Arc, or any Chromium-based browser.

### Steps to Install Locally

1. **Clone or Download this repository**:
   ```bash
   git clone https://github.com/ankitpandeynine/Cu-lms-fixer.git
   ```
   *(Alternatively, download the ZIP from GitHub and extract it to a folder).*

2. **Open Extensions page in your browser**:
   - In Chrome / Brave: go to `chrome://extensions`
   - In Edge: go to `edge://extensions`

3. **Enable Developer Mode**:
   - Toggle on **Developer mode** in the top-right corner.

4. **Load the Extension**:
   - Click the **Load unpacked** button in the top-left corner.
   - Select the extracted repository root — for example, `Cu-lms-fixer-main` — **not** the ZIP file, `Downloads` folder, or a parent folder.
   - Confirm the selected folder contains `manifest.json` directly alongside `content.js`, `popup.html`, and `background.js`.

5. **Pin and Use**:
   - Click the puzzle icon 🧩 in your browser toolbar and pin **CU LMS Fixer**.
   - Navigate to [CU LMS](https://lms.cuchd.in) and enjoy an enhanced experience!

---


### Troubleshooting: “Manifest file is missing or unreadable”

Chrome shows this message before it evaluates the extension configuration: it means the folder chosen in **Load unpacked** does not contain a readable `manifest.json` file at its top level.

1. Extract the downloaded ZIP completely first (do not load the ZIP itself).
2. In **Load unpacked**, open the extracted `Cu-lms-fixer-main` folder and select the folder where you can see `manifest.json` directly.
3. If the archive created an extra nested folder, select that inner folder instead. A valid selection contains `manifest.json`, `content.js`, `background.js`, and `popup.html` together.
4. Re-download and extract the repository if `manifest.json` is absent or has been renamed (for example, to `manifest.json.txt`).

## ⚙️ Extension Settings & Configuration

Click the extension icon in your browser toolbar to open the settings panel:

| Option | Description | Default |
| :--- | :--- | :--- |
| **Enable download button** | Adds direct 1-click download buttons on file resources | `Enabled` |
| **Enable copy button** | Adds 1-click text copy buttons to reading material pages | `Enabled` |
| **Hide and disable SOP popup (permanently)** | Completely blocks the popup & hides the SOP button | `Disabled` |
| **Only disable auto SOP popup** | Suppresses auto-popup on load, allows opening via button | `Enabled` |
| **Disable automatic CUIMS popups** | Closes automatic popups on CUIMS Student Home | `Enabled` |

---

## 🔒 Privacy & Security

- **100% Client-Side**: All script executions occur locally within your browser.
- **Zero Telemetry**: No user data, passwords, session tokens, or analytics are ever collected, tracked, or transmitted.
- **Official Session Passthrough**: Downloads and page copies reuse your existing authenticated browser cookies via native Chrome APIs.

---

## 💻 Tech Stack & Architecture

- **Manifest V3** compatible
- **Background Service Worker**: Manages download queues and conflicts with `chrome.downloads`
- **Content Scripts**: Dynamic DOM parsing and real-time observation using `MutationObserver`
- **Chrome Storage API**: Live cross-tab synchronization of user preferences

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/ankitpandeynine/Cu-lms-fixer).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

<div align="center">
  <sub>Made with ❤️ for Chandigarh University students</sub>
</div>
