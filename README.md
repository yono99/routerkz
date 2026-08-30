# routerkz MIBP Version

A local AI routing gateway with provider fallback and token-saving features. This is a fork of [decolua/routerkz](https://github.com/decolua/routerkz).

## Installation

### Option 1: Docker

Pull the image:

```bash
docker pull mhiqrambhrng/routerkz-mibp-version:latest
```

Run the container:

```bash
mkdir -p routerkz-data
docker run -d \
  --name routerkz \
  -p 20128:20128 \
  -v routerkz-data:/app/data \
  -e DATA_DIR=/app/data \
  -e PORT=20128 \
  -e HOSTNAME=0.0.0.0 \
  -e NODE_ENV=production \
  -e JWT_SECRET=<generate-with-openssl-rand-hex-32> \
  -e INITIAL_PASSWORD=<your-dashboard-password> \
  -e API_KEY_SECRET=<generate-with-openssl-rand-hex-32> \
  -e MACHINE_ID_SALT=<generate-with-openssl-rand-hex-32> \
  mhiqrambhrng/routerkz-mibp-version:latest
```

Or using Docker Compose (a `docker-compose.yml` is included in this repo):

```bash
cp .env.example .env   # fill in JWT_SECRET, INITIAL_PASSWORD, API_KEY_SECRET, MACHINE_ID_SALT
docker compose up -d
```

Dashboard opens at `http://localhost:20128/dashboard`.

### Windows desktop launcher

Install the CLI globally to make `routerkz` available from any Command Prompt:

```powershell
npm install --global routerkz
routerkz --version
routerkz -b
```

To run it without a console window and keep it in the Windows notification area, copy this file to the Desktop and double-click it:

```text
%APPDATA%\npm\node_modules\routerkz\src\cli\windows-launcher.vbs
```

The tray menu opens the dashboard, restarts routerkz, enables startup with Windows, or quits the gateway. Manage a background instance from any terminal with `routerkz --status` and `routerkz --stop`.

### Option 2: Manual (from source)

Requirements: Node.js 22 or newer.

```bash
git clone https://github.com/mhiqrambg/routerkz-mibp-version.git
cd routerkz-mibp-version

cp .env.example .env
# Edit .env: set JWT_SECRET, INITIAL_PASSWORD, API_KEY_SECRET, MACHINE_ID_SALT

npm install

# Development server
npm run dev

# Or production build
npm run build
npm run start
```

Dashboard opens at `http://localhost:20128/dashboard`.

## More Information

- Upstream project: [https://github.com/decolua/routerkz](https://github.com/decolua/routerkz)
- Upstream docs: [DOCKER.md](DOCKER.md) • [ARCHITECTURE.md](docs/ARCHITECTURE.md)
