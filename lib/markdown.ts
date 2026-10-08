// Tiny Markdown renderer for the help page (lib/help-content.ts).
//
// Only what that page uses: #/##/### headings, paragraphs, "-" and "1." lists
// (with indented continuation lines), **bold**, `code`, [text](url) links and
// bare https:// links. Everything else is escaped text. ## headings get an id
// so other pages can link to a topic (e.g. /help#cancel-a-subscription).
// Same output as scripts/build-help.mjs in the app repo.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function inline(text: string): string {
  const parts: string[] = [];
  const re = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|(https:\/\/[^\s)]*[^\s).,;:!?"])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    parts.push(esc(text.slice(last, m.index)));
    if (m[1] !== undefined) parts.push(`<code>${esc(m[1])}</code>`);
    else if (m[2] !== undefined) parts.push(`<a href="${esc(m[3])}">${esc(m[2])}</a>`);
    else if (m[4] !== undefined) parts.push(`<strong>${esc(m[4])}</strong>`);
    else parts.push(`<a href="${esc(m[5])}">${esc(m[5])}</a>`);
    last = re.lastIndex;
  }
  parts.push(esc(text.slice(last)));
  return parts.join("");
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  let list: { tag: "ul" | "ol"; items: string[] } | null = null;
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) {
      out.push(`<${list.tag}>\n${list.items.map((i) => `<li>${inline(i)}</li>`).join("\n")}\n</${list.tag}>`);
    }
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m: RegExpExecArray | null;
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    if ((m = /^(#{1,3}) (.+)$/.exec(line))) {
      flushPara();
      flushList();
      const level = m[1].length;
      const text = m[2].trim();
      const id = level === 2 ? ` id="${slug(text)}"` : "";
      out.push(`<h${level}${id}>${inline(text)}</h${level}>`);
      continue;
    }
    if ((m = /^(-|\d+\.) (.+)$/.exec(line))) {
      flushPara();
      const tag = m[1] === "-" ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push(m[2].trim());
      continue;
    }
    if (list && /^\s+\S/.test(line)) {
      list.items[list.items.length - 1] += " " + line.trim();
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return out.join("\n");
}
