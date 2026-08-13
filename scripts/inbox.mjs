#!/usr/bin/env node
/**
 * Operator inbox. Reads INTAKE_READ_TOKEN from ~/.local/credentials/aiautomatehelp.
 * Prints to this terminal only. Do not pipe customer text to ntfy or git.
 *
 *   node scripts/inbox.mjs queue
 *   node scripts/inbox.mjs list
 *   node scripts/inbox.mjs decide <uuid> quoted|declined|received [quote text...]
 *   node scripts/inbox.mjs update <uuid> <text>
 *   node scripts/inbox.mjs decide <uuid> delivered <handoff text>
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";

const BASE = "https://www.aiautomatehelp.com";

function loadToken() {
  const text = readFileSync(`${homedir()}/.local/credentials/aiautomatehelp`, "utf8");
  for (const line of text.split("\n")) {
    if (line.startsWith("INTAKE_READ_TOKEN=")) return line.slice("INTAKE_READ_TOKEN=".length).trim();
  }
  throw new Error("missing INTAKE_READ_TOKEN");
}

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${loadToken()}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, json };
}

const [cmd, id, status, ...rest] = process.argv.slice(2);

if (cmd === "queue") {
  const { status: http, json } = await call("GET", "/api/inbox?view=queue");
  if (!json.ok || !json.queue) {
    console.error("queue_failed", http, json.code ?? "error");
    process.exit(1);
  }
  const queue = json.queue;
  console.log(`attention ${queue.attention}`);
  console.log(`received ${queue.received}`);
  console.log(`quoted ${queue.quoted}`);
  console.log(`accepted ${queue.accepted}`);
  console.log(`paid ${queue.paid ?? 0}`);
  console.log(`questions ${queue.questions}`);
  console.log(`declined ${queue.declined}`);
  console.log(`withdrawn ${queue.withdrawn}`);
  if (queue.last) {
    console.log(`last ${queue.last.event} ${queue.last.id} ${queue.last.status} ${queue.last.at}`);
  } else {
    console.log("last none");
  }
  process.exit(0);
}

if (cmd === "list") {
  const { status: http, json } = await call("GET", "/api/inbox");
  if (!json.ok) {
    console.error("list_failed", http, json.code ?? "error");
    process.exit(1);
  }
  const items = json.items ?? [];
  console.log(`count ${items.length}`);
  for (const item of items) {
    console.log("---");
    console.log(`id ${item.id}`);
    console.log(`status ${item.status}`);
    console.log(`receivedAt ${item.receivedAt}`);
    console.log(`name ${item.name}`);
    console.log(`email ${item.email}`);
    console.log(`company ${item.company}`);
    if (item.amountCents) console.log(`amountCents ${item.amountCents}`);
    console.log("message");
    console.log(item.message);
    if (item.quoteText) {
      console.log("quoteText");
      console.log(item.quoteText);
    }
    if (item.customerReply) {
      console.log("customerReply");
      console.log(item.customerReply);
    }
    if (item.updateText) {
      console.log("updateText");
      console.log(item.updateText);
    }
  }
  process.exit(0);
}

if (cmd === "update" && id) {
  const updateText = [status, ...rest].filter(Boolean).join(" ").trim();
  if (!updateText) {
    console.error("usage: node scripts/inbox.mjs update <uuid> <text>");
    process.exit(2);
  }
  const { status: http, json } = await call("PATCH", "/api/inbox", { id, updateText });
  if (!json.ok) {
    console.error("update_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`ok ${json.id} ${json.status}`);
  process.exit(0);
}

if (cmd === "decide" && id && status) {
  let quoteText = rest.join(" ").trim();
  let amountCents = 0;
  let updateText = "";
  if (status === "quoted") {
    const dollars = Number(rest[0]);
    if (!Number.isInteger(dollars) || dollars < 1) {
      console.error("usage: node scripts/inbox.mjs decide <uuid> quoted <dollars> <quote text>");
      process.exit(2);
    }
    amountCents = dollars * 100;
    quoteText = rest.slice(1).join(" ").trim();
  }
  if (status === "delivered") {
    updateText = rest.join(" ").trim();
    if (!updateText) {
      console.error("usage: node scripts/inbox.mjs decide <uuid> delivered <handoff text>");
      process.exit(2);
    }
  }
  const { status: http, json } = await call("PATCH", "/api/inbox", {
    id,
    status,
    quoteText,
    amountCents,
    updateText,
  });
  if (!json.ok) {
    console.error("decide_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`ok ${json.id} ${json.status}`);
  if (typeof json.amountCents === "number" && json.amountCents > 0) {
    console.log(`amountCents ${json.amountCents}`);
  }
  process.exit(0);
}

console.error("usage: node scripts/inbox.mjs queue");
console.error("       node scripts/inbox.mjs list");
console.error("       node scripts/inbox.mjs decide <uuid> quoted <dollars> <quote text>");
console.error("       node scripts/inbox.mjs decide <uuid> declined|received [note]");
console.error("       node scripts/inbox.mjs update <uuid> <text>");
console.error("       node scripts/inbox.mjs decide <uuid> delivered <handoff text>");
process.exit(2);
