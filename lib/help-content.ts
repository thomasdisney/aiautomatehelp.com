// The help page text, served at /help (HTML) and /help.md (plain Markdown).
//
// Written for people and for AI agents helping them. The app serves the same
// text at https://app.notjunk.si/help and /help.md (pwa/help.md in the app
// repo); keep the two copies identical.

export const HELP_MD = `# Junk Drawer Agents help

Answers to common questions about Junk Drawer Agents. This page is written for
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

You are setting up Junk Drawer Agents for the first time or adding a computer.

### Facts

- One account password unlocks every computer you pair. It must be at least 8
  characters and is case-sensitive.
- The password is saved on your phone. It is never sent in a web address and
  never stored on your computer.
- Pairing uses a **one-time setup code** made by the app. It works once and
  expires after 15 minutes.
- When setup finishes, the computer prints a pairing code. Opening
  https://app.notjunk.si/ followed by that code goes straight to that
  computer.

### Steps

1. Open https://app.notjunk.si on your phone and choose **Set up**.
2. Type a device name (optional) and an account password.
3. Tap **Set password**.
4. Tap **Pair a device**. The app shows a one-time setup code.
5. On the computer, run the Junk Drawer Agents installer and paste the setup
   code when it asks.
6. Keep the app open. It moves on by itself when the computer comes online.

### If it still fails

- "Timed out waiting for the device": run the installer again with the same
  setup code, then reload the app. If the code has expired, tap
  **Pair a device** for a new one.
- "That password doesn't match the account": see "Wrong password".

## Sign in on another phone

### Use this when

You want to use the app on a new phone or browser, or you used the app before
it moved to https://app.notjunk.si.

### Facts

- Your saved password and pairing live in the browser where you set them up.
  A new phone, a new browser or a new web address starts empty.
- A phone that was paired at the app's earlier address keeps working there.
  To use the new address, sign in once as below.

### Steps

1. Open https://app.notjunk.si and choose **Sign in**.
2. Type your account password and the pairing code your computer printed.
3. Tap **Sign in**. The app opens that computer.
4. To put the app on your home screen: on iPhone, tap **Share**, then
   **Add to Home Screen**. On Android, use the browser menu and choose
   **Install app** or **Add to Home screen**.

### If it still fails

- You don't have the pairing code: run the installer on the computer again
  with a new setup code. It prints the code at the end.

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

- Run the installer on the computer again with a new setup code from
  **Pair a device**. Running it again is safe.

## Wrong password

### Use this when

The app says "That password doesn't match the account".

### Facts

- There is one account password for all your computers. It is the one you
  chose at **Set password**, not a GitHub or Stripe password.
- The password is case-sensitive and at least 8 characters.

### Steps

1. Check caps lock and type the password again.
2. Make sure you are signing in to the account you set up.
3. Try once more.

### If it still fails

- The password can't be recovered from the app. Paired computers keep working.
  Setting up again makes a new account.

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
- Your saved password and pairing live in your phone's browser. Clearing the
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

- Junk Drawer Agents is run by Forager Station Holdings LLC, a Nevada limited
  liability company.
- Notices go by mail to its registered agent.
- There is no support email or phone line.

### Steps

1. Address the letter to: Forager Station Holdings LLC, c/o its registered
   agent, 732 South 6th Street, Las Vegas, NV 89101.
2. Include your name, the email address on your Stripe receipt, and what you
   are asking for.
`;
