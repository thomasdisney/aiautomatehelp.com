// Host canonicalization and site config.
//   npm test   (node --experimental-strip-types --test tests/*.test.mts)
import test from "node:test";
import assert from "node:assert/strict";
import { canonicalHostRedirect, DEFAULT_HOST_CONFIG } from "../lib/canonical-host.ts";
import { hostList, originOr, DEFAULT_SITE_URL } from "../lib/site-config.ts";

const CUTOVER = {
  canonicalHost: "notjunk.si",
  aliasHosts: ["www.notjunk.si", "aiautomatehelp.com", "www.aiautomatehelp.com"],
};

test("today: apex aiautomatehelp.com goes to www, path and query kept", () => {
  const to = canonicalHostRedirect("aiautomatehelp.com", new URL("http://aiautomatehelp.com/agent?x=1&y=2"));
  assert.equal(to?.href, "https://www.aiautomatehelp.com/agent?x=1&y=2");
  assert.equal(DEFAULT_HOST_CONFIG.canonicalHost, "www.aiautomatehelp.com");
});

test("today: www.aiautomatehelp.com is canonical and stays put", () => {
  assert.equal(canonicalHostRedirect("www.aiautomatehelp.com", new URL("https://www.aiautomatehelp.com/")), null);
});

test("cutover: every alias host lands on notjunk.si with path and query", () => {
  for (const host of CUTOVER.aliasHosts) {
    const to = canonicalHostRedirect(`${host}:443`, new URL(`https://${host}/some/path?code=bright-oak`), CUTOVER);
    assert.equal(to?.href, "https://notjunk.si/some/path?code=bright-oak", host);
  }
  assert.equal(canonicalHostRedirect("notjunk.si", new URL("https://notjunk.si/"), CUTOVER), null);
});

test("cutover: /api/* is answered on every host, never redirected", () => {
  for (const host of CUTOVER.aliasHosts) {
    assert.equal(canonicalHostRedirect(host, new URL(`https://${host}/api/agent-code`), CUTOVER), null);
    assert.equal(canonicalHostRedirect(host, new URL(`https://${host}/api`), CUTOVER), null);
  }
});

test("unknown hosts (previews, vercel.app) are left alone", () => {
  assert.equal(canonicalHostRedirect("aiautomatehelp-abc.vercel.app", new URL("https://x.vercel.app/"), CUTOVER), null);
  assert.equal(canonicalHostRedirect(undefined, new URL("https://notjunk.si/"), CUTOVER), null);
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
