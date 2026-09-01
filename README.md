# AutomateAI

Marketing site for [aiautomatehelp.com](https://aiautomatehelp.com/).

One scoped automation at a time. Fixed quote after a brief. Paid before work starts.

Customer support is on the site. Briefs go to a private inbox I operate. Status is looked up on /status with the reference and email. Quotes are posted to that same page. Customers accept the stored done-when test with the quote, decline until the quote is paid, ask a question there, or confirm that test after the handoff. A decline closes those terms; I can post a new quote on the same brief. That later quote, and a revision of a live quote, needs a public note so /status does not still read as the old no. Do not add a personal email, phone, calendar, or founder contact.

```bash
node scripts/inbox.mjs queue
node scripts/inbox.mjs show <uuid>
node scripts/inbox.mjs list
node scripts/inbox.mjs find <email>
node scripts/inbox.mjs decide <uuid> quoted 800 2026-09-08 --done "A test row appears" "Fixed price $800. Pay before I start."
node scripts/inbox.mjs decide <uuid> quoted 500 2026-09-08 --done "A test row appears" --note "New offer: smaller scope." "Revised scope. Fixed price $500. Pay before I start."
node scripts/inbox.mjs note <uuid> "internal plan"
node scripts/inbox.mjs decide <uuid> delivered "It writes new rows to the sheet. Check the Status tab."
node scripts/inbox.mjs delete <uuid>
```

`queue` prints counts, the last event id, work I still owe (`need`), and briefs waiting on the customer (`wait`: a follow-up on a received brief, a quote they have not answered, an accepted quote they can actually pay, or a handoff they have not confirmed). `need` and `wait` are newest activity first, so a new question on an older brief is at the top of `need`. Deleting a brief also drops `last` when that id was the last event, so the queue does not point at a 404. Unauthenticated inbox calls are rate-limited on their own bucket, so a 401 flood cannot lock the operator queue. `list` prints id, status, and received time — not name, email, or job text. After I quote, that row also includes `amountCents`, `dueAt`, and `updateAt` so I can see the stored price, delivery date, and when I posted that quote without `show` (which prints the brief). After they ask a question I have not answered, that row also includes `questionAt` so I can see the unanswered note time without `show`. After they confirm the stored test, that row also includes `confirmedAt` so I do not need `show` just to see that the job closed. `find` prints those same id rows for one email so I can recover a lost reference; it does not print the email. Use `show <uuid>` for one brief. `note` is operator-only and does not appear on /status. `delete` removes a stored brief; it does not print the job. A public update on a received brief parks it on `wait` until they reply. A posted quote parks on `wait` until they accept, turn it down, or ask. An accepted quote stays on `need` while checkout is disconnected until I post the handoff or they turn it down or ask. I can hand off that accepted job without payment only while checkout is off. Once checkout is connected, that accepted quote parks on `wait` until they pay, turn it down, or ask, and accepted-to-delivered is forbidden until it is paid. A paid brief stays on `need` until I post the handoff. That handoff parks on `wait` until they confirm the stored done-when test or ask. A note sent with confirm does not put the job back on `need`; a later question after confirm does. Do not pipe customer text to ntfy or commit it.

```bash
npm install
npm run dev
```

Production deploys from `main` via Vercel project `aiautomatehelp.com`.
