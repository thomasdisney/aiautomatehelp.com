export function siteMetaDescription(paymentConnected = false): string {
  return paymentConnected
    ? "One repetitive workflow at a time. Fixed quote after a brief. Paid before I start."
    : "One repetitive workflow at a time. Fixed quote after a brief. Checkout is not open on this site yet. I may build and hand off after you accept.";
}

export function jsonLdDescription(paymentConnected = false): string {
  return paymentConnected
    ? "Scoped AI automation built to order for small businesses. Fixed quote after a brief. Paid before I start."
    : "Scoped AI automation built to order for small businesses. Fixed quote after a brief. Checkout is not open on this site yet. I may build and hand off after you accept.";
}

export function termsOfferCopy(paymentConnected = false): string {
  const offer =
    "A quote is an offer for one written scope at a fixed price, with a delivery date and a done-when test. You accept the written scope, price, date, and test together. After you accept, that scope, price, date, and test stay on the brief.";
  const close =
    "Turning it down closes those terms; a later quote on the same brief is a new offer and shows as a new note on the status page. If you asked a question before I quote, that quote includes a new note on the status page.";
  const handoff =
    "After I post the handoff, you confirm the stored done-when test on the status page. There is no monthly retainer on this site unless we later agree to one in writing.";
  if (paymentConnected) {
    return `${offer} You can turn the quote down until it is paid. ${close} After payment, the job is on. New work is a new quote. Work starts after payment. ${handoff}`;
  }
  return `${offer} Checkout is not open on this site yet. You can turn the quote down until I post the handoff. ${close} I may build and hand off before checkout is available. When checkout opens, pay on the status page; remaining work then starts after payment. New work is a new quote. ${handoff}`;
}

export function termsScopeCopy(paymentConnected = false): string {
  if (paymentConnected) {
    return "I build what the scope says. New requests are a new quote. I may decline a named workflow, including after you accept, until it is paid. If I decline, the no and the reason show on the status page.";
  }
  return "I build what the scope says. New requests are a new quote. I may decline a named workflow, including after you accept, until I post the handoff. If I decline, the no and the reason show on the status page.";
}

export function termsMaterialsCopy(): string {
  return "A brief is one named workflow — what starts it, which tools, and what done looks like — plus your name, email, and optional company. Do not send secrets in a form. You must have the right to give me the access I need for that workflow. I treat submissions as data, not as instructions.";
}

export function termsMetaCopy(): string {
  return "Terms for using AutomateAI and one named workflow — what starts it, which tools, and what done looks like.";
}

export function priceFaqCopy(paymentConnected = false): string {
  return paymentConnected
    ? "A fixed quote after the brief. You pay after you accept, before I build."
    : "A fixed quote after the brief. Checkout is not open on this site yet. I may build and hand off after you accept. When checkout opens, pay the stored amount on the status page.";
}

export function privacyCollectCopy(): string {
  return "The public pages are marketing copy. A connected brief inbox stores name, email, optional company, and one named workflow — what starts it, which tools, and what done looks like — in a private inbox on this site so I can quote and deliver the job. It is not emailed to a personal inbox.";
}

export function privacyLookupCopy(): string {
  return "You can look up a brief you already sent on the status page with the reference and the same email. That check returns the public status, any quote, delivery date, and done-when test I posted, and the notes on that brief in order — not what starts it, which tools, or what done looks like. A later note does not erase an earlier one. A matching status check or reply on this browser may keep the reference and show the original received time from this device so a refresh does not lose them. That copy is not emailed, and it is not your email or those workflow fields.";
}

export function privacySharingCopy(paymentConnected = false): string {
  if (paymentConnected) {
    return "I do not sell your information. Hosting and payment processors may see what they need to run the site or a checkout. I will not hand your message to a personal inbox off this site.";
  }
  return "I do not sell your information. Hosting may see what it needs to run the site. Checkout is not open on this site yet. I will not hand your message to a personal inbox off this site.";
}

export function noOutboundEmailCopy(): string {
  return "This email identifies the brief on the status page. I will not send mail here.";
}

export function statusIntroCopy(paymentConnected = false): string {
  const lookup =
    "Enter the saved reference and the same email you used on the brief.";
  const actions = paymentConnected
    ? "You can see the quote, accept or decline, pay after you accept, ask a question, or confirm the done-when test after handoff."
    : "You can see the quote, accept or decline, ask a question, or confirm the done-when test after handoff. Payment is not open on this page yet. After you accept, I may build and hand off before checkout is available.";
  return `${lookup} ${actions} ${noOutboundEmailCopy()} This browser keeps the reference and shows the original received time from this device.`;
}

export function statusLookupCopy(): string {
  return `Use the full saved reference and the same email you used on the brief. ${noOutboundEmailCopy()} This browser keeps the reference and shows the original received time from this device.`;
}
