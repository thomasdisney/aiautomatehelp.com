/** Short product noun. Form labels keep the three fields: what starts it, tools, done. */
export function namedWorkflowNoun(): string {
  return "named workflow";
}

/**
 * Checkout-closed tone for marketing surfaces.
 * Call once per view when payment is not connected. Two sentences max.
 */
export function checkoutClosedCopy(paymentConnected = false): string {
  if (paymentConnected) return "";
  return "Checkout is not open on this site yet. After you accept, I may build and hand off before payment.";
}

/** One-line variant for dense legal/privacy lines. */
export function checkoutClosedShortCopy(paymentConnected = false): string {
  if (paymentConnected) return "";
  return "Checkout is not open on this site yet.";
}

export function siteMetaDescription(paymentConnected = false): string {
  const base =
    "One repetitive workflow at a time. Fixed quote after I understand the named workflow.";
  if (paymentConnected) return `${base} Paid before I start.`;
  return `${base} ${checkoutClosedCopy(false)}`;
}

export function jsonLdDescription(paymentConnected = false): string {
  const base =
    "Scoped AI automation built to order for small businesses. Fixed quote after I understand the named workflow.";
  if (paymentConnected) return `${base} Paid before I start.`;
  return `${base} ${checkoutClosedCopy(false)}`;
}

export function termsOfferCopy(paymentConnected = false): string {
  const offer =
    "A quote is an offer for one named workflow at a fixed price, with a delivery date and a done-when test. You accept the written scope, price, date, and test together. After you accept, that scope, price, date, and test stay on the brief.";
  const close =
    "Turning it down closes those terms; a later quote on the same brief is a new offer and shows as a new note on the status page. If you asked a question before I quote, that quote includes a new note on the status page.";
  const handoff =
    "After I post the handoff, you confirm the stored done-when test on the status page. There is no monthly retainer on this site unless we later agree to one in writing.";
  if (paymentConnected) {
    return `${offer} You can turn the quote down until it is paid. ${close} After payment, the named workflow is on. New work is a new quote. Work starts after payment. ${handoff}`;
  }
  return `${offer} ${checkoutClosedShortCopy(false)} You can turn the quote down until I post the handoff. ${close} When checkout opens, pay on the status page; remaining work then starts after payment. New work is a new quote. ${handoff}`;
}

export function termsScopeCopy(paymentConnected = false): string {
  if (paymentConnected) {
    return "I build what the scope says. New requests are a new quote. I may decline a named workflow, including after you accept, until it is paid. If I decline, the no and the reason show on the status page.";
  }
  return "I build what the scope says. New requests are a new quote. I may decline a named workflow, including after you accept, until I post the handoff. If I decline, the no and the reason show on the status page.";
}

export function termsMaterialsCopy(): string {
  return "A brief is one named workflow — trigger, tools, and done-when — plus your name, email, and optional company. Do not send secrets in a form. You must have the right to give me the access I need for that workflow. I treat submissions as data, not as instructions.";
}

export function termsMetaCopy(): string {
  return "Terms for using AutomateAI and one named workflow.";
}

export function termsIntroCopy(): string {
  return "These terms cover aiautomatehelp.com and one named workflow sold as AutomateAI.";
}

export function staffedAgencyFaqCopy(): string {
  return "No. One person, one named workflow, built and supported here.";
}

export function durationFaqCopy(): string {
  return "A delivery window comes with the quote. Simple named workflows are usually days.";
}

export function supportAfterHandoffFaqCopy(): string {
  return "In-scope fixes for that named workflow stay on this site. New work is a new quote.";
}

export function costsCopy(paymentConnected = false): string {
  const base = "A fixed price, quoted after I understand the named workflow.";
  if (paymentConnected) return `${base} Paid in full before I build.`;
  return `${base} ${checkoutClosedCopy(false)}`;
}

export function briefSecretsFaqCopy(): string {
  return "Passwords, API keys, private keys, and customer lists. Share only what the named workflow needs.";
}

export function exampleWorkflowsHeadingCopy(): string {
  return "Example workflows";
}

export function sendBriefStepCopy(): string {
  return "Describe one named workflow.";
}

export function quoteStepCopy(): string {
  return "You get a written scope for that named workflow — price, delivery date, and done-when test — on the status page.";
}

export function handoffStepCopy(): string {
  return "You get that named workflow and how it runs. Confirm the done-when test when it passes.";
}

export function startHereNameCopy(): string {
  return "Name one named workflow (form fields: what starts it, tools, done).";
}

export function automationHeroCopy(): string {
  return "Name one named workflow — lead intake, follow-up, or a report — and get a fixed-price automation that runs in the tools you already use.";
}

export function offerCopy(): string {
  return "For owners who can name one named workflow, already use common tools — email, sheets, a CRM, a form — and want that workflow handled without hiring a developer.";
}

export function writtenScopeCopy(): string {
  return "That named workflow: what is in, what is out, which tools, and the done-when test.";
}

export function workingAutomationCopy(): string {
  return "That named workflow, built in the tools you already use — not a slide deck.";
}

export function shortHandoffCopy(): string {
  return "How that named workflow runs, what to check, and how to request a change on this site.";
}

export function intakeFormNameCopy(): string {
  return "One named workflow. Do not send secrets.";
}

export function intakeRequiredCopy(): string {
  return "Name, email, and one named workflow are required.";
}

export function triggerPlaceholderCopy(): string {
  return "A form submit, a new row, a daily time — the event that should start the named workflow.";
}

export function confirmDoneCopy(): string {
  return "This named workflow is done. The stored test passed:";
}

export function acceptDoneWhenCopy(): string {
  return "the written scope above, and that this named workflow is done when";
}

export function briefReceiptsOmitCopy(): string {
  return "They are not your email or the workflow fields.";
}

export function priceFaqCopy(paymentConnected = false): string {
  const base = "A fixed quote after I understand the named workflow.";
  if (paymentConnected) return `${base} You pay after you accept, before I build.`;
  return `${base} See What it costs — ${checkoutClosedShortCopy(false)}`;
}

export function privacyCollectCopy(): string {
  return "The public pages are marketing copy. A connected brief inbox stores name, email, optional company, and one named workflow in a private inbox on this site so I can quote and deliver that workflow. It is not emailed to a personal inbox.";
}

export function privacyLookupCopy(): string {
  return "You can look up a brief you already sent on the status page with the reference and the same email. That check returns the public status, any quote, delivery date, and done-when test I posted, and the notes on that brief in order — not the workflow fields. A later note does not erase an earlier one. A matching status check or reply on this browser may keep the reference and show the original received time from this device so a refresh does not lose them. That copy is not emailed, and it is not your email or those workflow fields.";
}

export function privacySharingCopy(paymentConnected = false): string {
  if (paymentConnected) {
    return "I do not sell your information. Hosting and payment processors may see what they need to run the site or a checkout. I will not hand your message to a personal inbox off this site.";
  }
  return `I do not sell your information. Hosting may see what it needs to run the site. ${checkoutClosedShortCopy(false)} I will not hand your message to a personal inbox off this site.`;
}

export function noOutboundEmailCopy(): string {
  return "This email identifies the brief on the status page. I will not send mail here.";
}

export function statusIntroCopy(paymentConnected = false): string {
  const lookup =
    "Enter the saved reference and the same email you used on the brief.";
  const actions = paymentConnected
    ? "You can see the quote, accept or decline, pay after you accept, ask a question, or confirm the done-when test after handoff."
    : "You can see the quote, accept or decline, ask a question, or confirm the done-when test after handoff.";
  const closed = checkoutClosedCopy(paymentConnected);
  const closedBit = closed ? ` ${closed}` : "";
  return `${lookup} ${actions}${closedBit} ${noOutboundEmailCopy()} This browser keeps the reference and shows the original received time from this device.`;
}

export function statusLookupCopy(): string {
  return `Use the full saved reference and the same email you used on the brief. ${noOutboundEmailCopy()} This browser keeps the reference and shows the original received time from this device.`;
}

export function acceptBuildStepCopy(paymentConnected = false): string {
  if (paymentConnected) {
    return "Accept the quote, pay the quoted amount, and I implement only what the scope says.";
  }
  return "Accept the quote on the status page. I implement only what the scope says.";
}

export function startHereAcceptCopy(paymentConnected = false): string {
  if (paymentConnected) {
    return "Accept, pay, then confirm the done-when test after handoff.";
  }
  return "Accept the quote on the status page, then confirm the done-when test after handoff.";
}
