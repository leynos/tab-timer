# AGENTS.md — Guidance for Autonomous Coding Agents

Welcome, silicon colleague! This repository welcomes **agentic AI coding tools** so long as they operate transparently, deterministically, and **never leave the tree in a broken state**. The rules below tell you how to propose, implement, and validate changes.

> **Scope** These guidelines apply to any non‑human contributor that opens a pull‑request or pushes commits, whether that agent is ChatGPT‑based, GitHub Copilot‑based, or home‑grown.

---

## 1. Golden Rules

|  # |  Rule                                                                                                                  |  Why it matters                       |
| -- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
|  1 | **Leave the branch build‑green.** Running `make lint build` **must** finish without error or warnings.                 | Humans trust CI to catch regressions. |
|  2 | **No orphan artefacts.** Update docs and manifests when you add/rename/remove files.                                   | Prevents drift between code and docs. |
|  3 | **Respect the licence.** All third‑party assets must be CC0/CC‑BY and include attribution in `README.md` or `CREDITS`. | Legal peace of mind.                  |
|  4 | **Small, atomic commits** with Conventional Commit prefixes (feat, fix, ci, docs, chore, refactor, style, perf).       | Easier reviews and revertability.     |
|  5 | **Explain yourself in plain English** in PRs (`.github/PULL_REQUEST_TEMPLATE.md` is provided; fill it).                | Human maintainers need context.       |
|  6 | **Never discard user data.** Storage keys under `timers` must migrate, not reset.                                      | Data integrity for live users.        |

---

## 2. Directory Map

```text
manifest.json            # WebExtension manifest (MV3)
background.js            # Service‑worker code
contentScript.js         # Injected into each tab
popup.{html,js,css}      # UI
icons/                   # CC0/CC‑BY art (48 & 96 png)
LICENSE                  # ISC
README.md, Makefile      # Dev docs & tasks
AGENTS.md                # <- you are here
```

Any new top‑level file or directory **must** be documented in the list above.

---

## 3. What You May Change

| Area                 | Permitted Actions                                                       | Guard‑rails                                                                   |
| -------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Background logic** | Optimise timer handling, add features (e.g. custom snooze, badge text). | Must keep MV3 worker constraints (no long‑lived globals).                     |
| **Popup UI**         | Improve UX, localisation, accessibility.                                | Never exceed 150 kB uncompressed JS per Google/AMO guideline.                 |
| **Build tooling**    | Extend `Makefile`, add GitHub Actions.                                  | All automation must be optional for local dev (no required proprietary SaaS). |
| **Docs**             | Expand tutorials, update screenshots.                                   | Use Oxford English spelling.                                                  |
| **Assets**           | Replace icons with higher‑resolution or different style.                | Must satisfy Rule 3 (licence) and update manifest/icon paths.                 |

---

## 4. Validation Checklist

Before committing, an agent **MUST** run the following and parse exit codes:

```bash
# 1. Static analysis
make lint          # => 0 exit status

# 2. Build artefact
make build         # creates dist/*.xpi; ensure file exists and non‑empty

# 3. Runtime smoke test (optional but preferred)
web-ext run -t chromium --no-input --quit-after-install 3  # closes after 3 s
```

If any step fails → abort the commit or PR and report diagnostics.

---

## 5. Semantic Versioning

Agents should bump `manifest.json > version` following **SemVer**:

* **MAJOR** – backwards‑incompatible change (rare).
* **MINOR** – new functionality, backwards‑compatible.
* **PATCH** – bug‑fixes, docs, internal refactor.

`Makefile` parses the field via `jq`; keep it numeric (x.y.z).

---

## 6. Pull‑Request Expectations

A valid PR raised by an agent must:

1. **Reference an Issue** or state the motivation in the description.
2. Include **Before/After screenshots or GIFs** for UI changes.
3. Quote any **external sources** used for code or assets.
4. Pass the full **CI matrix** (Linux & macOS, latest ESR & Nightly).

---

## 7. Unsafe Actions (Just Don’t)

* Force‑pushing to *main*.
* Rewriting human commit history.
* Committing credentials or embedding telemetry without consent.
* Executing network calls in build scripts.

Violation ➜ automatic CI rejection, human maintainer review required.

---

## 8. Meta‑Guidelines for Large Language Model Agents

1. **Chain‑of‑Thought Isolation** – Do not commit your private reasoning; only final code and concise explanations.
2. **Temperature ≤ 0.3** – favour determinism to keep diffs reproducible.
3. **Citation** – When code is derived from docs/StackOverflow, add a source comment with URL and licence.
4. **Diff Awareness** – Generate *minimal* patches; prefer `sed`‑style replacements over full‑file rewrites unless necessary.

---

## 9. Contact

For clarifications ping **@leynos** or open an **Issue: question**. Humans are friendly but protective of their tabs. 😄

Happy hacking, mechanical friend! Keep the bells ringing on time.
