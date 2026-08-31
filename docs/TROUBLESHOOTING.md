# Troubleshooting

## Creating an API key fails with HTTP 500 ("Failed to create key")

**Symptom**

- Dashboard (Endpoint page) shows a generic "Failed to create key" error.
- Browser console: `POST /api/keys 500 (Internal Server Error)`.
- `GET /api/keys` works fine (the database layer is healthy).
- The server console logs the actual reason:

```
Error creating key: [AUTH] API_KEY_SECRET must be set to a random value of at least 32 characters
```

**Cause**

Local API keys are signed, not random: the format is
`sk-{machineId}-{keyId}-{crc8}`, where `crc8` is an HMAC-SHA256 tag keyed with
`API_KEY_SECRET` (`src/shared/utils/apiKey.js`). The generator refuses to sign
anything when `API_KEY_SECRET` is unset or shorter than 32 characters, and
`POST /api/keys` turns that into the generic 500. Two things make this easy to
hit:

1. The in-code dev fallback secret (`endpoint-proxy-api-key-secret`) is only 29
   characters and fails the same `< 32` check — so key creation fails in every
   mode, including `npm run dev`, unless the env var is set explicitly.
2. An instance launched by the routerkz CLI (`cli/app/custom-server.js` →
   standalone `cli/app/server.js`) does **not** read `.env` files. Next.js only
   loads `.env` through the `next dev` / `next start` CLI; the standalone
   server and the CLI launcher inherit plain `process.env`. A repo `.env` has
   no effect on a CLI/tray-launched instance.

**Fix**

Set `API_KEY_SECRET` to a random value of at least 32 characters in the
environment of the server process, then restart the instance:

- One-off (PowerShell, same shell that starts routerkz):

  ```powershell
  $env:API_KEY_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  routerkz
  ```

- Persistent (User level), then start routerkz from a **new** shell (already
  running shells keep their old environment):

  ```powershell
  [Environment]::SetEnvironmentVariable(
    'API_KEY_SECRET',
    (node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"),
    'User'
  )
  ```

- Repo workflows (`npm run dev` / `npm run start`): set it in `.env` (copy
  `.env.example`) — the `next` CLI loads `.env` in these modes.

**Verify**

With a dashboard session, `POST /api/keys` with `{"name":"..."}` returns 201
and a `sk-...` key; `GET /api/keys` lists it. Each running instance needs the
variable in its own environment — restarting one instance does not fix
another (e.g. a second instance on a different port started before the change).

**Do not rotate the secret casually**

Every existing key embeds an HMAC tag computed with this secret. Changing
`API_KEY_SECRET` makes `parseApiKey`'s CRC check fail for all existing keys,
so they stop authenticating immediately. Generate it once and keep it. Keep it
out of version control: `.gitignore` excludes `.env*` (except
`.env.example`).
