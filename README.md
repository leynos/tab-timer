# Tab Timer ‑ a per‑tab countdown extension for Firefox

A lightweight WebExtension that lets you attach an individual countdown timer to any open tab.  When the timer elapses the tab’s title is prefixed with a 🔔 bell, a desktop notification is raised, and the extension’s popup keeps track of all running/elapsed timers with buttons to *Cancel* or *Snooze*.

<div align="center">
  <img src="icons/bell-96.png" width="96" alt="🔔">
</div>

## Features

* **Per‑tab timers** — set hours · minutes · seconds.
* **Visual cue** — tab title gains `🔔` when time is up.
* **Toast notification** — uses the built‑in Firefox notification API.
* **Persistent across restarts** — timers survive closing/re‑opening Firefox.
* **Popup dashboard** — list of all active/elapsed timers, one‑click *Cancel* or *Snooze 5 min*.

---

## Quick start (development)

```bash
# Clone the repo
$ git clone https://github.com/leynos/tab-timer.git
$ cd tab-timer

# Install web-ext once (Node ≥ 18)
$ npm install --global web-ext

# Launch a temporary Firefox profile with the extension loaded
$ make run
```

The Makefile’s **`run`** target simply calls `web-ext run`.  This starts Firefox with a fresh profile, loads the extension from the working tree, and streams console logs to your terminal.

---

## Building a release package

```bash
$ make build        # produces dist/tab-timer-vX.Y.Z.xpi
```

*The **XPI** is just a renamed zip and can be side‑loaded in* `about:debugging` *or uploaded to* <https://addons.mozilla.org>.

---

## Project layout

```
.
├── manifest.json          # WebExtension manifest (MV3)
├── background.js          # Service‑worker background script
├── contentScript.js       # Marks tab title when timer fires
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── style.css              # Popup styling (minimal)
├── icons/
│   ├── bell-48.png        # Toolbar / notification icons
│   └── bell-96.png
├── LICENSE                # ISC licence
├── Makefile               # Convenience tasks (build, run, lint, clean)
└── README.md              # This file
```

---

## Requirements

* **Firefox ≥ 109** (first version with MV3 support enabled by default)
* **Node JS ≥ 18** (only for developer tasks via `web-ext`)

---

## Common tasks

| Command           | What it does                                                |
|-------------------|-------------------------------------------------------------|
| `make run`        | Launches Firefox with the extension loaded (dev profile).   |
| `make lint`       | Runs `web-ext lint` on the working tree.                    |
| `make build`      | Creates a signed‑off XPI in `dist/`.                        |
| `make clean`      | Removes the `dist/` directory.                              |

---

## Contributing

1. Fork the repo and create your branch: `git checkout -b feature/my‑feature`.
2. Commit your changes: `git commit -am 'Add my feature'`.
3. Push to the branch: `git push origin feature/my‑feature`.
4. Open a pull request.

Bug reports and feature suggestions are also very welcome — please open an issue.

---

## Licence

This project is licensed under the ISC licence — see [`LICENSE`](LICENSE) for the full text.

[Icon by Rian Maulana](https://www.freepik.com/icon/alarm_7467233#fromView=search&page=1&position=8&uuid=42edda76-22f3-47b5-a45f-c02c51a1cdca)
