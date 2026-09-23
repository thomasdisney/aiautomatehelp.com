"use client";

import { useEffect } from "react";

/** Same-device convenience: prefill #email from sanitized ?email= without changing StatusForm props. */
export function StatusEmailPrefiller({ email }: { email: string }) {
  useEffect(() => {
    if (!email) return;
    const el = document.getElementById("email") as HTMLInputElement | null;
    if (!el) return;
    if (!el.value) {
      el.value = email;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, [email]);
  return null;
}
