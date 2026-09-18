export function siteMetaDescription(paymentConnected = false): string {
  return paymentConnected
    ? "One repetitive workflow at a time. Fixed quote after a brief. Paid before I start."
    : "One repetitive workflow at a time. Fixed quote after a brief. Checkout is not open on this site yet.";
}

export function jsonLdDescription(paymentConnected = false): string {
  return paymentConnected
    ? "Scoped AI automation built to order for small businesses. Fixed quote after a brief. Paid before I start."
    : "Scoped AI automation built to order for small businesses. Fixed quote after a brief. Checkout is not open on this site yet.";
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
    return "I build what the scope says. New requests are a new quote. I may decline a job, including after you accept, until it is paid. If I decline, the no and the reason show on the status page.";
  }
  return "I build what the scope says. New requests are a new quote. I may decline a job, including after you accept, until I post the handoff. If I decline, the no and the reason show on the status page.";
}

export function priceFaqCopy(paymentConnected = false): string {
  return paymentConnected
    ? "A fixed quote after the brief. You pay after you accept, before I build."
    : "A fixed quote after the brief. Checkout is not open on this site yet. I may build and hand off after you accept. When checkout opens, pay the stored amount on the status page.";
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
