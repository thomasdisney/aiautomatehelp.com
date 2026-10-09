// Host canonicalization and site config.
//   npm test   (node --experimental-strip-types --test tests/*.test.mts)
import test from "node:test";
import assert from "node:assert/strict";
import { canonicalHostRedirect, DEFAULT_HOST_CONFIG } from "../lib/canonical-host.ts";
import {
  hostList,
  originOr,
  DEFAULT_SITE_URL,
  DEFAULT_AGENT_URL,
  DEFAULT_ALIAS_HOSTS,
  SITE_URL,
  SITE_HOST,
  AGENT_URL,
  SITE_ALIAS_HOSTS,
} from "../lib/site-config.ts";

const ALIASES = ["www.notjunk.si"];

test("defaults are the live hosts: notjunk.si landing, app.notjunk.si app", () => {
  assert.equal(DEFAULT_SITE_URL, "https://notjunk.si");
  assert.equal(DEFAULT_AGENT_URL, "https://app.notjunk.si");
  assert.deepEqual(DEFAULT_ALIAS_HOSTS, ALIASES);
  assert.deepEqual(DEFAULT_HOST_CONFIG, { canonicalHost: "notjunk.si", aliasHosts: ALIASES });
  // With no env set (as in this test run), the middleware config is the same.
  assert.equal(SITE_URL, "https://notjunk.si");
  assert.equal(SITE_HOST, "notjunk.si");
  assert.equal(AGENT_URL, "https://app.notjunk.si");
  assert.deepEqual(SITE_ALIAS_HOSTS, ALIASES);
});

test("www.notjunk.si 308s to notjunk.si with path and query", () => {
  for (const host of ALIASES) {
    const to = canonicalHostRedirect(`${host}:443`, new URL(`https://${host}/some/path?code=bright-oak&x=1`));
    assert.equal(to?.href, "https://notjunk.si/some/path?code=bright-oak&x=1", host);
    const root = canonicalHostRedirect(host, new URL(`http://${host}/`));
    assert.equal(root?.href, "https://notjunk.si/", host);
  }
});

test("notjunk.si itself never redirects (no loop), whatever the path", () => {
  for (const path of ["/", "/help", "/help.md", "/x?y=1", "/api/agent-code"]) {
    assert.equal(canonicalHostRedirect("notjunk.si", new URL(`https://notjunk.si${path}`)), null, path);
    assert.equal(canonicalHostRedirect("NOTJUNK.SI:443", new URL(`https://notjunk.si${path}`)), null, path);
  }
});

test("/api/* is answered on every host, never redirected (the setup form POSTs /api/agent-code)", () => {
  for (const host of ALIASES) {
    assert.equal(canonicalHostRedirect(host, new URL(`https://${host}/api/agent-code`)), null);
    assert.equal(canonicalHostRedirect(host, new URL(`https://${host}/api`)), null);
  }
});

test("unknown hosts (previews, vercel.app, retired domains) are left alone", () => {
  assert.equal(canonicalHostRedirect("aiautomatehelp-abc.vercel.app", new URL("https://x.vercel.app/")), null);
  assert.equal(canonicalHostRedirect("aiautomatehelp.com", new URL("https://aiautomatehelp.com/")), null);
  assert.equal(canonicalHostRedirect("www.aiautomatehelp.com", new URL("https://www.aiautomatehelp.com/")), null);
  assert.equal(canonicalHostRedirect("app.notjunk.si", new URL("https://app.notjunk.si/")), null);
  assert.equal(canonicalHostRedirect(undefined, new URL("https://notjunk.si/")), null);
});

test("env overrides still work (staging copy)", () => {
  const staging = { canonicalHost: "staging.example", aliasHosts: ["www.staging.example"] };
  assert.equal(
    canonicalHostRedirect("www.staging.example", new URL("https://www.staging.example/a?b=1"), staging)?.href,
    "https://staging.example/a?b=1",
  );
  assert.equal(canonicalHostRedirect("aiautomatehelp.com", new URL("https://aiautomatehelp.com/"), staging), null);
});

test("site config only accepts bare https origins", () => {
  assert.equal(originOr(undefined, DEFAULT_SITE_URL), DEFAULT_SITE_URL);
  assert.equal(originOr("https://notjunk.si", DEFAULT_SITE_URL), "https://notjunk.si");
  assert.equal(originOr("https://notjunk.si/", DEFAULT_SITE_URL), "https://notjunk.si");
  assert.equal(originOr("http://notjunk.si", DEFAULT_SITE_URL), DEFAULT_SITE_URL);
  assert.equal(originOr("https://notjunk.si/x", DEFAULT_SITE_URL), DEFAULT_SITE_URL);
  assert.equal(originOr("not a url", DEFAULT_SITE_URL), DEFAULT_SITE_URL);
  assert.deepEqual(hostList(" www.notjunk.si, AIAUTOMATEHELP.com ,bad host", []), ["www.notjunk.si", "aiautomatehelp.com"]);
  assert.deepEqual(hostList("", ["aiautomatehelp.com"]), ["aiautomatehelp.com"]);
});
