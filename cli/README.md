# routerkz - FREE AI Router & Token Saver

**Never stop coding. Save 20-40% tokens with RTK + auto-fallback to FREE & cheap AI models.**

**Connect All AI Code Tools (Claude Code, Cursor, Antigravity, Copilot, Codex, Gemini, OpenCode, Cline, OpenClaw...) to 40+ AI Providers & 100+ Models.**

[![npm](https://img.shields.io/npm/v/routerkz.svg)](https://www.npmjs.com/package/routerkz)
[![Downloads](https://img.shields.io/npm/dm/routerkz.svg)](https://www.npmjs.com/package/routerkz)
[![Docker Pulls](https://img.shields.io/docker/pulls/decolua/routerkz.svg?logo=docker&label=Docker%20pulls)](https://hub.docker.com/r/decolua/routerkz)
[![GHCR](https://img.shields.io/badge/GHCR-decolua%2Frouterkz-blue?logo=github)](https://github.com/decolua/routerkz/pkgs/container/routerkz)
[![License](https://img.shields.io/npm/l/routerkz.svg)](https://github.com/decolua/routerkz/blob/main/LICENSE)

<a href="https://trendshift.io/repositories/22628" target="_blank"><img src="https://trendshift.io/api/badge/repositories/22628" alt="decolua%2Frouterkz | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

[🌐 Website](https://routerkz.com) • [📖 Full Docs](https://github.com/decolua/routerkz)

---

## 🤔 Why routerkz?

**Stop wasting money, tokens and hitting limits:**

- ❌ Subscription quota expires unused every month
- ❌ Rate limits stop you mid-coding
- ❌ Tool outputs (git diff, grep, ls...) burn tokens fast
- ❌ Expensive APIs ($20-50/month per provider)

**routerkz solves this:**

- ✅ **RTK Token Saver** - Auto-compress tool_result, save 20-40% tokens
- ✅ **Maximize subscriptions** - Track quota, use every bit before reset
- ✅ **Auto fallback** - Subscription → Cheap → Free, zero downtime
- ✅ **Multi-account** - Round-robin between accounts per provider
- ✅ **Universal** - Works with any OpenAI/Claude-compatible CLI

---

## ⚡ Quick Start

**Option 1 — npm (recommended for desktop):**

```bash
npm install -g routerkz
routerkz

# Or run directly with npx
npx routerkz
```

**Option 2 — Docker (server/VPS):**

```bash
docker run -d --name routerkz -p 20128:20128 \
  -v "$HOME/.routerkz:/app/data" -e DATA_DIR=/app/data \
  decolua/routerkz:latest
```

Published images: [Docker Hub](https://hub.docker.com/r/decolua/routerkz) • [GHCR](https://github.com/decolua/routerkz/pkgs/container/routerkz) (multi-platform amd64/arm64).

🎉 Dashboard opens at `http://localhost:20128`

**2. Connect a FREE provider (no signup needed):**

Dashboard → Providers → Connect **Kiro AI** (free Claude unlimited) or **OpenCode Free** (no auth) → Done!

**3. Use in your CLI tool:**

```
Claude Code/Codex/OpenClaw/Cursor/Cline Settings:
  Endpoint: http://localhost:20128/v1
  API Key:  [copy from dashboard]
  Model:    kr/claude-sonnet-4.5
```

That's it! Start coding with FREE AI models.

---

## 🚀 CLI Options

```bash
routerkz                    # Start with default settings
routerkz --port 8080        # Custom port
routerkz --no-browser       # Don't open browser
routerkz --skip-update      # Skip auto-update check
routerkz --background       # Run in background (detached daemon)
routerkz --launcher         # Start hidden in the Windows/macOS/Linux tray
routerkz --status           # Show background instance status
routerkz --stop             # Stop the running instance
routerkz --help             # Show all options
```

### 🖥️ Run in Background

`routerkz --background` (alias `-b`) starts the gateway as a detached daemon —
no UI, no tray requirement — and returns immediately. Output is appended to a
log file and the supervisor PID is recorded so you can manage the instance:

| Action   | Command                |
|----------|------------------------|
| Start    | `routerkz --background` |
| Check    | `routerkz --status`     |
| Stop     | `routerkz --stop`       |

- **Log file**: `%APPDATA%/routerkz/routerkz.log` (Windows) or `~/.routerkz/routerkz.log` (macOS/Linux)
- **PID file**: `routerkz.pid` in the same directory (used by `--stop`)
- **Custom port**: `routerkz --background --port 8080`

**Dashboard**: `http://localhost:20128/dashboard`

### 🔔 Hide to Tray

Choosing **Hide to Tray (Background)** in the interactive menu hands the
gateway to a detached tray supervisor and closes the console. Notes:

- The gateway keeps running after you close the terminal (the supervisor and
  server are detached from it).
- Opening `routerkz` in another terminal **attaches** to the running gateway
  instead of killing it — the menu works against it, and `Exit`/Ctrl+C there
  leave the gateway running. Only `routerkz --stop` or the tray's Quit shut
  it down.
- A gateway started this way (or via `--background`) survives server crashes:
  the supervisor restarts it automatically.

### 🛠 Development — make `routerkz` run this repo's code

On a dev machine, the global `routerkz` command can keep pointing at a stale
published install while you edit this repo. Link them so the command always
runs the working tree (no repack needed after edits):

```bash
cd cli
npm link          # junction %APPDATA%\npm\node_modules\routerkz -> this folder
```

- The shims (`%APPDATA%\npm\routerkz.cmd`) keep working unchanged — they now
  resolve through the junction to `cli.js` in this repo.
- Roll back to a published install anytime with
  `npm unlink -g routerkz && npm i -g routerkz`.
- The gateway bundle under `cli/app` is still produced by `npm run build`
  (from `cli/scripts/build-cli.js`) — link only affects which `cli.js`
  supervises it.

### Windows clickable launcher

The package includes `src/cli/windows-launcher.vbs`. After installing routerkz, copy this file to the Desktop or create a shortcut to it. Double-clicking the file starts routerkz with no console window, binds it to `127.0.0.1`, and keeps the gateway available from the notification-area tray icon.

For a global install, the launcher is located at:

```text
%APPDATA%\npm\node_modules\routerkz\src\cli\windows-launcher.vbs
```

The tray menu provides **Open Dashboard**, **Restart routerkz**, **Enable Auto-start**, and **Quit**. Running the launcher again is safe: routerkz detects the existing instance and does not start a duplicate gateway.

If `routerkz` is not recognized after installation, close and reopen Command Prompt/PowerShell, then verify:

```powershell
npm install --global routerkz
routerkz --version
routerkz -b
```

---

## 🛠️ Supported CLI Tools

Claude-Code • OpenClaw • Codex • OpenCode • Cursor • Antigravity • Cline • Continue • Droid • Roo • Copilot • Kilo Code • Gemini CLI • Qwen Code • iFlow • Crush • Crusher • Aider

Any tool supporting OpenAI/Claude-compatible API works.

---

## 💾 Data Location

- **macOS/Linux**: `~/.routerkz/db/data.sqlite`
- **Windows**: `%APPDATA%/routerkz/db/data.sqlite`
- **Docker**: `/app/data/db/data.sqlite` (mount `$HOME/.routerkz` to persist)

---

## 📚 Documentation

Full docs, advanced setup, video tutorials & development guide:

- **GitHub**: https://github.com/decolua/routerkz
- **Full README**: https://github.com/decolua/routerkz/blob/main/app/README.md
- **Website**: https://routerkz.com

---

## 🙏 Acknowledgments

- **[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)** - Original Go implementation

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
