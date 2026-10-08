# Moving to notjunk.si

The full plan lives in the `opencode-companion` repo: `docs/CUTOVER-notjunk.md` on branch `chore/notjunk-cutover`.

What this site needs at cutover. None of it happens before `notjunk.si` is registered (the Dynadot order is pending payment as of 2026-10-08).

1. Add `notjunk.si` and `www.notjunk.si` to this Vercel project. `www.notjunk.si` redirects to `notjunk.si` (308).
2. Set env vars, then deploy:
   - `NEXT_PUBLIC_SITE_URL=https://notjunk.si`
   - `NEXT_PUBLIC_AGENT_URL=https://app.notjunk.si`
   - `NEXT_PUBLIC_SITE_ALIAS_HOSTS=www.notjunk.si,aiautomatehelp.com,www.aiautomatehelp.com`
3. Set `aiautomatehelp.com` and `www.aiautomatehelp.com` to redirect to `notjunk.si` (308). Keep both domains on the project and keep renewing `aiautomatehelp.com`.

With none of the env vars set, the site behaves as it does today: `aiautomatehelp.com` redirects to `www.aiautomatehelp.com` and the app links go to `agent.aiautomatehelp.com`.

`middleware.ts` is the backup if the domain redirects aren't set. It sends alias hosts to `NEXT_PUBLIC_SITE_URL` with a 308, keeps the path and query, and never redirects `/api/*`.

Check after each step:

```sh
curl -sI https://aiautomatehelp.com/x?y=1 | grep -i location      # https://notjunk.si/x?y=1
curl -sI https://www.aiautomatehelp.com/x?y=1 | grep -i location  # https://notjunk.si/x?y=1
curl -sI https://www.notjunk.si/x?y=1 | grep -i location          # https://notjunk.si/x?y=1
curl -s https://notjunk.si/robots.txt                             # Host: notjunk.si
```

`vercel.json` turns off Vercel deploys for the `chore/notjunk-cutover` branch only.
