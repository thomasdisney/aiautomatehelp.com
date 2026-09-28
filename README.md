# ai automate — landing

Landing site for [aiautomatehelp.com](https://aiautomatehelp.com/), the front
door to the **ai automate** agent product. The app itself lives at
[agent.aiautomatehelp.com](https://agent.aiautomatehelp.com/).

The root page explains the product and takes the pairing code printed by the
agent's setup. `POST /api/agent-code` checks that code against the agent host,
and the browser then opens the matching agent URL. Nothing else is stored here.

```bash
npm install
npm run dev
```

Production deploys from `main` via the Vercel project `aiautomatehelp.com`.
