/** @doc Server-only page reader used by the Deep Research agent: pulls the
 *  readable text of a URL (Jina reader first, raw HTML fallback). */

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "0.0.0.0" || host === "::" || host === "::1") return true;
  const parts = host.split(".").map(Number);
  if (parts.length === 4 && parts.every(Number.isInteger)) {
    const [a, b] = parts;
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  return host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe8") || host.startsWith("fe9") || host.startsWith("fea") || host.startsWith("feb");
}

function safePublicUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return null;
    return isPrivateHostname(parsed.hostname) ? null : parsed;
  } catch {
    return null;
  }
}

export interface ReadUrlResult {
  url: string;
  title: string;
  text: string;
  error?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function withTimeout<T>(ms: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export async function readUrl(rawUrl: string, maxChars = 9000): Promise<ReadUrlResult> {
  const url = String(rawUrl || "").trim();
  const parsedUrl = safePublicUrl(url);
  if (!parsedUrl) return { url, title: "", text: "", error: "invalid or private url" };

  // 1) Jina reader — returns clean Markdown for most pages, no key needed.
  try {
    const out = await withTimeout(22_000, async (signal) => {
      const resp = await fetch(`https://r.jina.ai/${parsedUrl.href}`, {
        headers: { "User-Agent": BROWSER_UA, Accept: "text/plain" },
        signal,
      });
      if (!resp.ok) throw new Error(`jina HTTP ${resp.status}`);
      return await resp.text();
    });
    const cleaned = out.replace(/\n{3,}/g, "\n\n").trim();
    if (cleaned.length > 400) {
      const title = cleaned.match(/^Title:\s*(.+)$/m)?.[1]?.trim() || "";
      return { url, title, text: cleaned.slice(0, maxChars) };
    }
  } catch {
    /* fall through */
  }

  // 2) Raw fetch + tag strip.
  try {
    const html = await withTimeout(18_000, async (signal) => {
      const resp = await fetch(url, {
        headers: { "User-Agent": BROWSER_UA, Accept: "text/html,application/xhtml+xml" },
        redirect: "manual",
        signal,
      });
      if (resp.status >= 300 && resp.status < 400) throw new Error("redirect blocked");
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.text();
    });
    const title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").slice(0, 200);
    const text = stripHtml(html).slice(0, maxChars);
    if (text.length < 200) return { url, title, text, error: "too short" };
    return { url, title, text };
  } catch (err) {
    return {
      url,
      title: "",
      text: "",
      error: err instanceof Error ? err.message : "read failed",
    };
  }
}

export async function readUrls(urls: string[], maxChars = 9000): Promise<ReadUrlResult[]> {
  const list = urls.filter(Boolean).slice(0, 12);
  const out: ReadUrlResult[] = [];
  const WAVE = 4;
  for (let i = 0; i < list.length; i += WAVE) {
    const wave = list.slice(i, i + WAVE);
    out.push(...(await Promise.all(wave.map((u) => readUrl(u, maxChars)))));
  }
  return out;
}
