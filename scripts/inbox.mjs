#!/usr/bin/env node
/**
 * Operator inbox. Reads INTAKE_READ_TOKEN from ~/.local/credentials/aiautomatehelp.
 * Prints to this terminal only. Do not pipe customer text to ntfy or git.
 *
 *   node scripts/inbox.mjs queue
 *   node scripts/inbox.mjs show <uuid>
 *   node scripts/inbox.mjs list   # ids and statuses only
 *   node scripts/inbox.mjs find <email>  # ids for that email only; prints no email
 *   node scripts/inbox.mjs decide <uuid> quoted <dollars> <YYYY-MM-DD> --done <done when> [--note <text>] <quote text>
 *   node scripts/inbox.mjs decide <uuid> declined <reason>
 *   node scripts/inbox.mjs update <uuid> <text>
 *   node scripts/inbox.mjs note <uuid> <text>
 *   node scripts/inbox.mjs decide <uuid> delivered <handoff text>
 *   node scripts/inbox.mjs delete <uuid>
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
  console.log(`delivered ${queue.delivered ?? 0}`);
  console.log(`questions ${queue.questions}`);
  console.log(`declined ${queue.declined}`);
  console.log(`withdrawn ${queue.withdrawn}`);
  console.log(`waiting ${(queue.waiting ?? []).length}`);
  if (queue.last) {
    console.log(`last ${queue.last.event} ${queue.last.id} ${queue.last.status} ${queue.last.at}`);
  } else {
    console.log("last none");
  }
  for (const item of queue.needs ?? []) {
    console.log(`need ${item.event} ${item.id} ${item.status} ${item.at}`);
  }
  for (const item of queue.waiting ?? []) {
    console.log(`wait ${item.event} ${item.id} ${item.status} ${item.at}`);
  }
  process.exit(0);
}

if (cmd === "show" && id) {
  const { status: http, json } = await call("GET", `/api/inbox?id=${encodeURIComponent(id)}`);
  if (!json.ok || !json.item) {
    console.error("show_failed", http, json.code ?? "error");
    process.exit(1);
  }
  const item = json.item;
  console.log(`id ${item.id}`);
  console.log(`status ${item.status}`);
  console.log(`receivedAt ${item.receivedAt}`);
  console.log(`name ${item.name}`);
  console.log(`email ${item.email}`);
  console.log(`company ${item.company}`);
  if (item.amountCents) console.log(`amountCents ${item.amountCents}`);
  if (item.dueAt) console.log(`dueAt ${item.dueAt}`);
  if (item.updateAt) console.log(`updateAt ${item.updateAt}`);
  if (item.doneWhen) {
    console.log("doneWhen");
    console.log(item.doneWhen);
  }
  if (item.confirmedAt) console.log(`confirmedAt ${item.confirmedAt}`);
  if (item.acceptedAt) console.log(`acceptedAt ${item.acceptedAt}`);
  if (item.deliveredAt) console.log(`deliveredAt ${item.deliveredAt}`);
  if (item.withdrawnAt) console.log(`withdrawnAt ${item.withdrawnAt}`);
  if (item.declinedAt) console.log(`declinedAt ${item.declinedAt}`);
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
  if (item.operatorNote) {
    console.log("operatorNote");
    console.log(item.operatorNote);
  }
  if (Array.isArray(item.thread) && item.thread.length) {
    console.log(`thread ${item.thread.length}`);
    for (const entry of item.thread) {
      const role = entry?.role === "operator" ? "operator" : "customer";
      const at = typeof entry?.at === "string" ? entry.at : "";
      const text = typeof entry?.text === "string" ? entry.text : "";
      console.log(`${role} ${at}`);
      console.log(text);
    }
  }
  process.exit(0);
}

if (cmd === "list") {
  const { status: http, json } = await call("GET", "/api/inbox?view=ids");
  if (!json.ok || !Array.isArray(json.ids)) {
    console.error("list_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`count ${json.ids.length}`);
  for (const row of json.ids) {
    const id = typeof row?.id === "string" ? row.id : "";
    const status = typeof row?.status === "string" ? row.status : "";
    const receivedAt = typeof row?.receivedAt === "string" ? row.receivedAt : "";
    const confirmedAt = typeof row?.confirmedAt === "string" ? row.confirmedAt : "";
    const dueAt = typeof row?.dueAt === "string" ? row.dueAt : "";
    const amountCents = typeof row?.amountCents === "number" ? row.amountCents : 0;
    const questionAt = typeof row?.questionAt === "string" ? row.questionAt : "";
    const updateAt = typeof row?.updateAt === "string" ? row.updateAt : "";
    const acceptedAt = typeof row?.acceptedAt === "string" ? row.acceptedAt : "";
    const deliveredAt = typeof row?.deliveredAt === "string" ? row.deliveredAt : "";
    const withdrawnAt = typeof row?.withdrawnAt === "string" ? row.withdrawnAt : "";
    const declinedAt = typeof row?.declinedAt === "string" ? row.declinedAt : "";
    console.log(
      `${id} ${status} ${receivedAt}${amountCents ? ` ${amountCents}` : ""}${dueAt ? ` due ${dueAt}` : ""}${updateAt ? ` update ${updateAt}` : ""}${acceptedAt ? ` accepted ${acceptedAt}` : ""}${withdrawnAt ? ` withdrawn ${withdrawnAt}` : ""}${declinedAt ? ` declined ${declinedAt}` : ""}${deliveredAt ? ` delivered ${deliveredAt}` : ""}${confirmedAt ? ` confirmed ${confirmedAt}` : ""}${questionAt ? ` question ${questionAt}` : ""}`.trim(),
    );
  }
  process.exit(0);
}

if (cmd === "find" && id) {
  const { status: http, json } = await call("POST", "/api/inbox", { email: id });
  if (!json.ok || !Array.isArray(json.ids)) {
    console.error("find_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`count ${json.ids.length}`);
  for (const row of json.ids) {
    const foundId = typeof row?.id === "string" ? row.id : "";
    const foundStatus = typeof row?.status === "string" ? row.status : "";
    const receivedAt = typeof row?.receivedAt === "string" ? row.receivedAt : "";
    const confirmedAt = typeof row?.confirmedAt === "string" ? row.confirmedAt : "";
    const dueAt = typeof row?.dueAt === "string" ? row.dueAt : "";
    const amountCents = typeof row?.amountCents === "number" ? row.amountCents : 0;
    const questionAt = typeof row?.questionAt === "string" ? row.questionAt : "";
    const updateAt = typeof row?.updateAt === "string" ? row.updateAt : "";
    const acceptedAt = typeof row?.acceptedAt === "string" ? row.acceptedAt : "";
    const deliveredAt = typeof row?.deliveredAt === "string" ? row.deliveredAt : "";
    const withdrawnAt = typeof row?.withdrawnAt === "string" ? row.withdrawnAt : "";
    const declinedAt = typeof row?.declinedAt === "string" ? row.declinedAt : "";
    console.log(
      `${foundId} ${foundStatus} ${receivedAt}${amountCents ? ` ${amountCents}` : ""}${dueAt ? ` due ${dueAt}` : ""}${updateAt ? ` update ${updateAt}` : ""}${acceptedAt ? ` accepted ${acceptedAt}` : ""}${withdrawnAt ? ` withdrawn ${withdrawnAt}` : ""}${declinedAt ? ` declined ${declinedAt}` : ""}${deliveredAt ? ` delivered ${deliveredAt}` : ""}${confirmedAt ? ` confirmed ${confirmedAt}` : ""}${questionAt ? ` question ${questionAt}` : ""}`.trim(),
    );
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

if (cmd === "note" && id) {
  const operatorNote = [status, ...rest].filter(Boolean).join(" ").trim();
  if (!operatorNote) {
    console.error("usage: node scripts/inbox.mjs note <uuid> <text>");
    process.exit(2);
  }
  const { status: http, json } = await call("PATCH", "/api/inbox", { id, operatorNote });
  if (!json.ok) {
    console.error("note_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`ok ${json.id} ${json.status}`);
  process.exit(0);
}

if (cmd === "delete" && id) {
  const { status: http, json } = await call("DELETE", "/api/inbox", { id });
  if (!json.ok) {
    console.error("delete_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`ok ${id}`);
  process.exit(0);
}

if (cmd === "decide" && id && status) {
  let quoteText = rest.join(" ").trim();
  let amountCents = 0;
  let dueAt = "";
  let updateText = "";
  let doneWhen = "";
  if (status === "quoted") {
    const dollars = Number(rest[0]);
    dueAt = typeof rest[1] === "string" ? rest[1].trim() : "";
    const tail = rest.slice(2);
    const quoteParts = [];
    for (let i = 0; i < tail.length; i += 1) {
      if (tail[i] === "--done" && tail[i + 1]) {
        doneWhen = String(tail[i + 1]).trim();
        i += 1;
        continue;
      }
      if (tail[i] === "--note" && tail[i + 1]) {
        updateText = String(tail[i + 1]).trim();
        i += 1;
        continue;
      }
      quoteParts.push(tail[i]);
    }
    quoteText = quoteParts.join(" ").trim();
    if (
      !Number.isInteger(dollars) ||
      dollars < 1 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dueAt) ||
      !doneWhen ||
      !quoteText
    ) {
      console.error(
        "usage: node scripts/inbox.mjs decide <uuid> quoted <dollars> <YYYY-MM-DD> --done <done when> [--note <text>] <quote text>",
      );
      process.exit(2);
    }
    amountCents = dollars * 100;
  }
  if (status === "declined") {
    updateText = rest.join(" ").trim();
    quoteText = "";
    if (!updateText) {
      console.error("usage: node scripts/inbox.mjs decide <uuid> declined <reason>");
      process.exit(2);
    }
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
    dueAt,
    updateText,
    doneWhen,
  });
  if (!json.ok) {
    console.error("decide_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`ok ${json.id} ${json.status}`);
  if (typeof json.amountCents === "number" && json.amountCents > 0) {
    console.log(`amountCents ${json.amountCents}`);
  }
  if (typeof json.dueAt === "string" && json.dueAt) {
    console.log(`dueAt ${json.dueAt}`);
  }
  if (typeof json.doneWhen === "string" && json.doneWhen) {
    console.log(`doneWhen ${json.doneWhen}`);
  }
  process.exit(0);
}

console.error("usage: node scripts/inbox.mjs queue");
console.error("       node scripts/inbox.mjs show <uuid>");
console.error("       node scripts/inbox.mjs list");
console.error("       node scripts/inbox.mjs find <email>");
console.error(
  "       node scripts/inbox.mjs decide <uuid> quoted <dollars> <YYYY-MM-DD> --done <done when> [--note <text>] <quote text>",
);
console.error("       node scripts/inbox.mjs decide <uuid> declined <reason>");
console.error("       node scripts/inbox.mjs update <uuid> <text>");
console.error("       node scripts/inbox.mjs note <uuid> <text>");
console.error("       node scripts/inbox.mjs decide <uuid> delivered <handoff text>");
console.error("       node scripts/inbox.mjs delete <uuid>");
process.exit(2);
