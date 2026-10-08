# Junk Drawer Agents — landing

Landing site and pairing front door for Junk Drawer Agents. Today it is served
at [www.aiautomatehelp.com](https://www.aiautomatehelp.com/); the app lives at
[agent.aiautomatehelp.com](https://agent.aiautomatehelp.com/). Both are moving
to **notjunk.si** (landing) and **app.notjunk.si** (app). See
[docs/CUTOVER-notjunk.md](docs/CUTOVER-notjunk.md).

The root page takes the pairing code printed by the agent's setup.
`POST /api/agent-code` checks that code against the agent host, and the browser
then opens the matching agent URL. Nothing else is stored here.

Hostnames come from `lib/site-config.ts` (env-driven, defaults are today's
hosts).

```bash
npm install
npm run dev
npm test
```

Production deploys from `main` via the Vercel project `aiautomatehelp.com`.
