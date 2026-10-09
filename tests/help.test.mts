// /help and /help.md content, and public-copy rules for the landing site.
//   npm test   (node --experimental-strip-types --test tests/*.test.mts)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { HELP_MD } from "../lib/help-content.ts";
import { renderMarkdown, slug } from "../lib/markdown.ts";

const ROOT = new URL("..", import.meta.url).pathname;

test("help covers pairing, troubleshooting, billing basics and cancelling", () => {
  const html = renderMarkdown(HELP_MD);
  for (const heading of [
    "Set up and pair a computer",
    "Sign in on another phone",
    "A computer shows offline",
    "Plans and billing",
    "Cancel a subscription",
    "Refunds",
    "Privacy and data requests",
    "Legal notices by mail",
  ]) {
    assert.match(HELP_MD, new RegExp(`^## ${heading}$`, "m"), heading);
    assert.ok(html.includes(`<h2 id="${slug(heading)}">`), heading);
  }
  assert.match(HELP_MD, /https:\/\/app\.notjunk\.si\/billing/);
  assert.match(HELP_MD, /Forager Station Holdings LLC, c\/o its registered\s+agent, 732 South 6th Street, Las Vegas, NV 89101/);
});

test("markdown renderer escapes HTML and links bare URLs", () => {
  assert.equal(renderMarkdown("a <b> & c"), "<p>a &lt;b&gt; &amp; c</p>");
  assert.equal(
    renderMarkdown("See https://app.notjunk.si/help."),
    '<p>See <a href="https://app.notjunk.si/help">https://app.notjunk.si/help</a>.</p>',
  );
  assert.equal(renderMarkdown("- one\n  two\n- **three**"), "<ul>\n<li>one two</li>\n<li><strong>three</strong></li>\n</ul>");
});

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

const PUBLIC_SOURCES = [...files(join(ROOT, "app")), ...files(join(ROOT, "lib")), ...files(join(ROOT, "public"))].filter(
  (p) => /\.(tsx?|css|svg|md)$/.test(p),
);

test("no support email, mailto or 'email us' anywhere in the site", () => {
  for (const p of PUBLIC_SOURCES) {
    const text = readFileSync(p, "utf8");
    assert.doesNotMatch(text, /mailto:|support@|email us|e-mail us/i, p);
  }
  assert.doesNotMatch(HELP_MD, /@/);
});

test("no USB stick and no old brand in what visitors see", () => {
  for (const p of PUBLIC_SOURCES) {
    const text = readFileSync(p, "utf8");
    assert.doesNotMatch(text, /\busb\b|\bstick\b/i, p);
    assert.doesNotMatch(text, /AI Automate Help|ai automate|opencode-companion|nubilith/i, p);
  }
  for (const p of PUBLIC_SOURCES.filter((f) => /\.tsx$/.test(f) || /help-content/.test(f))) {
    // Host names in config/redirect code are fine; page copy must not show the old brand.
    assert.doesNotMatch(readFileSync(p, "utf8"), /aiautomatehelp/i, p);
  }
});

test("no third-party fonts, scripts or beacons", () => {
  for (const p of PUBLIC_SOURCES) {
    const text = readFileSync(p, "utf8");
    assert.doesNotMatch(text, /next\/font\/google|fonts\.googleapis|gstatic|googletagmanager|google-analytics|@vercel\/analytics|plausible|unpkg|jsdelivr/i, p);
  }
});
