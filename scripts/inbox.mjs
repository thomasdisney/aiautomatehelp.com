#!/usr/bin/env node
/**
 * Operator inbox. Reads INTAKE_READ_TOKEN from ~/.local/credentials/aiautomatehelp.
 * Prints to this terminal only. Do not pipe customer text to ntfy or git.
 *
 *   node scripts/inbox.mjs list
 *   node scripts/inbox.mjs decide <uuid> quoted|declined|received [quote text...]
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
    console.log("message");
    console.log(item.message);
    if (item.quoteText) {
      console.log("quoteText");
      console.log(item.quoteText);
    }
  }
  process.exit(0);
}

if (cmd === "decide" && id && status) {
  const quoteText = rest.join(" ").trim();
  const { status: http, json } = await call("PATCH", "/api/inbox", { id, status, quoteText });
  if (!json.ok) {
    console.error("decide_failed", http, json.code ?? "error");
    process.exit(1);
  }
  console.log(`ok ${json.id} ${json.status}`);
  process.exit(0);
}

console.error("usage: node scripts/inbox.mjs list");
console.error("       node scripts/inbox.mjs decide <uuid> quoted|declined|received [quote text]");
process.exit(2);
