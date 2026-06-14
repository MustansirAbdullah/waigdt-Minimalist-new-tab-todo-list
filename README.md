# waigdt — Minimalist new tab todo list

> What am I gonna do today?

A clean, distraction-free new tab page that keeps your daily tasks front and center and focuses on accounability. No accounts, no sync, no tracking. Just your tasks and you to blame.

![waigdt screenshot](assets/screenshot3.png)

---

## Download

| Browser | Link |
|---------|------|
| Chrome | *Coming soon* |
| Firefox | *Coming soon* |

---

## Features

- **Daily tasks** — add tasks, check them off, delete them
- **Auto archive** — tasks archive automatically at midnight so every day starts fresh
- **History** — review past days and see your completion rate
- **Live clock** — 24h clock that adapts to your task list
- **Dark mode** — clean light and dark theme
- **Custom background** — pick any background colour
- **Sound effects** — satisfying tick when you complete a task
- **Zero permissions** — only uses local storage, nothing leaves your device

---

## Screenshots

| History | Custom background |
|---------|------------------|
| ![History sidebar](assets/screenshot1.png) | ![Custom background](assets/screenshot2.png) |

---

## Install from source

### Chrome
1. Clone or download this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the project folder
5. Open a new tab

### Firefox
1. Clone or download this repo
2. Go to `about:debugging`
3. Click **This Firefox** → **Load Temporary Add-on**
4. Select the `manifest.json` file inside the project folder
5. Open a new tab

---

## Project structure

```
waigdt/
├── assets/          # Font, sound, icons, screenshots
├── scripts/
│   ├── storage.js   # chrome.storage wrappers
│   ├── tasks.js     # Task creation and management
│   ├── history.js   # History rendering
│   ├── settings.js  # Theme, sound, background colour
│   └── main.js      # Init and event listeners
├── styles/
│   ├── base.css     # Variables, resets, layout
│   ├── components.css  # Tasks, buttons, toggles
│   └── sidebar.css  # Sidebar, history, settings
├── index.html
└── manifest.json
```

---

## Contributing

PRs and issues welcome. Keep it minimal — if a feature would make this feel like a dashboard, it probably doesn't belong here.

---

## License

MIT
