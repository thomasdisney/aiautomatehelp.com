# AutomateAI

Marketing site for [aiautomatehelp.com](https://aiautomatehelp.com/).

One scoped automation at a time. Fixed quote after a brief. Paid before work starts.

Customer support is on the site. Briefs go to a private inbox I operate. Status is looked up on /status with the reference and email. Quotes are posted to that same page. Customers accept, decline, or ask a question there. Do not add a personal email, phone, calendar, or founder contact.

```bash
node scripts/inbox.mjs queue
node scripts/inbox.mjs list
node scripts/inbox.mjs decide <uuid> quoted 800 "Fixed price $800. Pay before I start."
```

`queue` prints counts and the last event id only. Do not pipe `list` output to ntfy or commit it.

```bash
npm install
npm run dev
```

Production deploys from `main` via Vercel project `aiautomatehelp.com`.
