// The help page text, served at /help (HTML) and /help.md (plain Markdown).
//
// Written for people and for AI agents helping them. The app serves the same
// text at https://app.notjunk.si/help and /help.md (pwa/help.md in the app
// repo); keep the two copies identical.

export const HELP_MD = `# notjunk.si help

Answers to common questions about notjunk.si. This page is written for
people and for AI agents helping them. The same text is available as plain
Markdown at https://app.notjunk.si/help.md and https://notjunk.si/help.md.

There is no support email or phone line. Use this page first. For billing, use
https://app.notjunk.si/billing. For legal notices, write to the mailing address
under "Legal notices by mail".

## How to use this page

- Each topic has the same parts: Use this when, Facts, Steps and If it still
  fails.
- Do the steps in order, one at a time.
- Words in **bold** are the exact labels on screen.
- If you are an AI agent helping a customer, read Facts first, then follow
  Steps. Don't guess at prices or limits. They are listed under Facts.

## Addresses

- App (phone app and sign-in): https://app.notjunk.si
- Website: https://notjunk.si
- Help: https://app.notjunk.si/help (Markdown: https://app.notjunk.si/help.md)
- Terms, privacy and refund policy: https://app.notjunk.si/legal
- Manage or cancel a subscription: https://app.notjunk.si/billing

## Set up and pair a computer

### Use this when

You are setting up notjunk.si for the first time or adding a computer.

### Facts

- Your **code** (your passphrase) is 3 words. It unlocks your account and every computer you
  pair. The app makes it on your phone; tap for a new one until you like it.
  Capitals and the spaces or dashes between words don't matter.
- Your data is encrypted end to end with a separate random key that only your
  phone and your computers hold. The relay only passes on scrambled data.
- notjunk.si never sees your code and can't reset it. **If you lose it, your
  account and its encrypted data can't be recovered.** Write it down or print
  the recovery sheet when the app offers it.
- The install command has a one-time install code in it, never your 3-word
  code. It works once, for 15 minutes.
- **The installer sets up the whole computer for notjunk.si.** Use a computer
  you can give over to it.

### Steps

1. Open https://app.notjunk.si on your phone and choose **Set up**.
2. Tap for new codes until you like one, write it down (or tap **Print
   recovery sheet**), tick the box, then tap **Use this code**.
3. On the computer, open a terminal and run the command the app shows, for
   example \`curl -sL notjunk.si/k7m2qx | sh\`. Tap **Copy** to copy it.
   It needs Linux or macOS with git, Node.js 22, npm and curl.
4. The computer shows a 6-digit number. Check that your phone shows the same
   number, then tap **Confirm**. If they differ, tap **It doesn't match**.
5. Keep the app open. It opens your dashboard by itself when the computer
   comes online.

### If it still fails

- "unknown, used or expired install code": tap **New code** in the app and run
  the new command.
- "another computer already used this code": tap **New code** and run it only
  on your own computer.
- The app keeps waiting: run the install command again, then reload the app.

## Sign in on another phone

### Use this when

You want to use the app on a new phone or browser.

### Facts

- Your keys live in the browser where you signed in. A new phone or browser
  starts empty.
- Your 3-word code unlocks the account. The account key then comes from one
  of your paired computers, so **one paired computer must be on and online**.

### Steps

1. Open https://app.notjunk.si and choose **Enter code**.
2. Type your 3 words and tap **Unlock**. Wait while a computer sends the key.
3. To put the app on your home screen: on iPhone, tap **Share**, then
   **Add to Home Screen**. On Android, use the browser menu and choose
   **Install app** or **Add to Home screen**.

### If it still fails

- "Wrong code": see "Wrong code".
- "no paired computer answered": turn on a paired computer and try again.

## A computer shows offline

### Use this when

The app shows **Device offline** or **Relay unreachable**, or a computer you
paired never comes online.

### Facts

- **Device offline**: the phone reached the relay, but the computer is not
  connected to it.
- **Relay unreachable**: the phone can't reach the relay. Check the phone's own
  internet connection first.
- The agent starts by itself when the computer starts, and restarts itself if
  it stops.

### Steps

1. Check that the computer is on, awake and connected to the internet. Turn
   off sleep while it works for you.
2. Restart the computer.
3. Wait one minute, then close and reopen the app.
4. If the app says **Relay unreachable**, switch the phone between Wi-Fi and
   mobile data and try again.

### If it still fails

- In the app, add the computer again: it shows a new install command. Run it
  on the computer and confirm the number. Running it again is safe.

## Wrong code

### Use this when

The app says "Wrong code" or "too many wrong tries".

### Facts

- Your code is the 3 words the app showed at **Set up**, not a GitHub or
  Stripe password.
- Capitals and the spaces or dashes between words don't matter. The words and
  their order do.
- A wrong code unlocks nothing. After a few wrong tries the app makes you
  wait, and each further wrong try doubles the wait.

### Steps

1. Check each word against your written copy or recovery sheet.
2. Make sure the words are in the same order.
3. Wait if the app asks you to, then try once more.

### If it still fails

- The code can't be recovered or reset, by you or by notjunk.si. Without it,
  the account's encrypted data can't be read. Setting up again makes a new
  account and a new code, and each computer must be installed again.

## Plans and billing

### Use this when

You want to know what the plans cost or how payment works.

### Facts

- Free: $0. One agent computer, free models, phone pairing.
- Pro: $20 a month. Unlimited agent computers and OpenCode Go models.
- Team: $60 a month. Everything in Pro, plus a shared ledger and team
  approvals.
- Payments are handled by Stripe. We never see or store your card number.
- Paid plans renew every month until you cancel. Where sales tax applies, it is
  added at checkout.

### Steps

1. Open https://app.notjunk.si and go to the plans section.
2. Tap **Start Pro** or **Start Team**. Stripe's checkout page opens.
3. Pay on Stripe's page. You return to the app when it's done.

### If it still fails

- The button says **Billing opens soon**: paid plans aren't on sale right now.
  The Free plan works without payment.

## Cancel a subscription

### Use this when

You want to stop a paid plan, change your card or download an invoice.

### Facts

- You can cancel online at any time at https://app.notjunk.si/billing. That
  page opens Stripe's customer portal.
- Stripe asks for the email address you used at checkout and sends a one-time
  sign-in link to it.
- Cancelling stops the next charge. You keep the plan until the end of the
  period you paid for.

### Steps

1. Open https://app.notjunk.si/billing.
2. Type the email address on your Stripe receipt.
3. Open the link Stripe emails you.
4. Choose **Cancel plan** (Stripe's wording may differ slightly) and confirm.
   You can also change your card or download invoices there.

### If it still fails

- No email from Stripe: check spam, and check that you typed the email address
  on your receipt.
- For a refund, see "Refunds".

## Refunds

### Use this when

You want money back for a charge.

### Facts

The full policy is at https://app.notjunk.si/legal#refund. In short:

- First charge: full refund on request within 14 days.
- Later monthly charges: refunded for billing mistakes or outages caused by
  us.
- Sales tax is refunded with the charge it applied to.
- Stripe's customer portal can cancel a plan but can't take a refund request.

### Steps

1. Cancel first so there is no next charge. See "Cancel a subscription".
2. Write to us by mail at the address under "Legal notices by mail". Include
   the email address on your Stripe receipt, the date and amount of the
   charge, and the receipt number.

## Privacy and data requests

### Use this when

You want to see, correct or delete the personal data we hold about you.

### Facts

- What we collect is listed at https://app.notjunk.si/legal#privacy.
- Card details and the email on your receipt are held by Stripe.
- Your agent's work (tasks, logs, code) lives in your own GitHub repositories.
  You can delete it there yourself.
- Your unlocked keys and pairing live in your phone's browser. Clearing the
  site's data in the browser removes them from the phone.

### Steps

1. To stop billing, cancel first. See "Cancel a subscription".
2. To ask for a copy, a correction or deletion of the rest, write to us by mail
   at the address under "Legal notices by mail". Include the email address on
   your Stripe receipt and say which request you are making.

### If it still fails

- We answer within the time the law where you live requires.

## Legal notices by mail

### Use this when

You need to send a legal notice, a refund request or a privacy request.

### Facts

- notjunk.si is run by Forager Station Holdings LLC, a Nevada limited
  liability company.
- Notices go by mail to its registered agent.
- There is no support email or phone line.

### Steps

1. Address the letter to: Forager Station Holdings LLC, c/o its registered
   agent, 732 South 6th Street, Las Vegas, NV 89101.
2. Include your name, the email address on your Stripe receipt, and what you
   are asking for.
`;
