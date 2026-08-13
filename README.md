# AutomateAI

Marketing site for [aiautomatehelp.com](https://aiautomatehelp.com/).

One scoped automation at a time. Fixed quote after a brief. Paid before work starts.

Customer support is on the site. Briefs go to a private inbox I operate. Status is looked up on /status with the reference and email. Quotes are posted to that same page. Customers accept the stored done-when test with the quote, decline until the quote is paid, or ask a question there. A decline closes those terms; I can post a new quote on the same brief. Do not add a personal email, phone, calendar, or founder contact.

```bash
node scripts/inbox.mjs queue
node scripts/inbox.mjs show <uuid>
node scripts/inbox.mjs list
node scripts/inbox.mjs decide <uuid> quoted 800 2026-08-20 --done "A test row appears" "Fixed price $800. Pay before I start."
node scripts/inbox.mjs note <uuid> "internal plan"
```

`queue` prints counts, the last event id, work I still owe (`need`), and briefs waiting on the customer (`wait`: a follow-up on a received brief, a quote they have not answered, or an accepted quote I have not been paid for). `list` prints id, status, and received time — not name, email, or job text. Use `show <uuid>` for one brief. `note` is operator-only and does not appear on /status. A public update on a received brief parks it on `wait` until they reply. A posted quote parks on `wait` until they accept, turn it down, or ask. An accepted quote parks on `wait` until they pay, turn it down, or ask. I start after it is paid. Do not pipe customer text to ntfy or commit it.

```bash
npm install
npm run dev
```

Production deploys from `main` via Vercel project `aiautomatehelp.com`.
