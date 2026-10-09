# Junk Drawer Agents — landing

Landing site and pairing front door for Junk Drawer Agents. The landing site is
at [notjunk.si](https://notjunk.si/) and the app at
[app.notjunk.si](https://app.notjunk.si/). The old hosts aiautomatehelp.com and
www.aiautomatehelp.com only 308-redirect to notjunk.si (see
[lib/canonical-host.ts](lib/canonical-host.ts)). See
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

Production deploys from `main` via the Vercel project (still named
`aiautomatehelp.com`).
