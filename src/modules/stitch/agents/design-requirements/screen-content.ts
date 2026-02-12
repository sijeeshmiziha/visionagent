/**
 * Screen content processing: HTML fetching and screen accessors.
 * Raw HTML is passed to the LLM for summarization (no local parsing).
 */

/** Cached screen HTML: rawHtml for LLM and contentSummary */
export interface ScreenHtmlEntry {
  rawHtml: string;
}

/** Optional cache: URL -> { rawHtml } */
export type ScreenContentCache = Map<string, ScreenHtmlEntry>;

/**
 * Fetch raw HTML from a Stitch download URL. Returns { rawHtml }.
 * No parsing; full HTML is passed to the LLM.
 */
export async function fetchScreenHtml(url: string): Promise<ScreenHtmlEntry> {
  const empty = { rawHtml: '' };
  try {
    const res = await fetch(url);
    if (!res.ok) return empty;
    const html = await res.text();
    return { rawHtml: html };
  } catch {
    return empty;
  }
}

export function getHtmlUrl(screen: {
  htmlCode?: { downloadUrl?: string };
  design?: unknown;
  [key: string]: unknown;
}): string | undefined {
  const htmlCode =
    screen.htmlCode ??
    (typeof screen.design === 'object' && screen.design !== null && 'htmlCode' in screen.design
      ? (screen.design as { htmlCode?: { downloadUrl?: string } }).htmlCode
      : undefined);
  return typeof htmlCode === 'object' &&
    htmlCode !== null &&
    typeof (htmlCode as { downloadUrl?: string }).downloadUrl === 'string'
    ? (htmlCode as { downloadUrl: string }).downloadUrl
    : undefined;
}

/**
 * Fetch and cache screen HTML. Returns { rawHtml } or empty if unavailable.
 */
export async function getScreenHtml(
  screen: {
    design?: unknown;
    htmlCode?: { downloadUrl?: string };
    [key: string]: unknown;
  },
  cache?: ScreenContentCache
): Promise<ScreenHtmlEntry> {
  const url = getHtmlUrl(screen);
  if (url) {
    const cached = cache?.get(url);
    if (cached) return cached;
    const entry = await fetchScreenHtml(url);
    if (entry.rawHtml) {
      cache?.set(url, entry);
      return entry;
    }
  }
  return { rawHtml: '' };
}

/**
 * Get content for a screen: raw HTML (passed to subagents; LLM summarizes).
 */
export function getContentSummary(
  htmlEntry: ScreenHtmlEntry,
  _screen: { design?: unknown; [key: string]: unknown }
): string {
  return htmlEntry.rawHtml || '(No HTML content available)';
}

export function getScreenshotUrl(screen: {
  screenshot?: { downloadUrl?: string };
  design?: unknown;
  [key: string]: unknown;
}): string | undefined {
  const s =
    screen.screenshot ??
    (typeof screen.design === 'object' && screen.design !== null && 'screenshot' in screen.design
      ? (screen.design as { screenshot?: { downloadUrl?: string } }).screenshot
      : undefined);
  return typeof s?.downloadUrl === 'string' ? s.downloadUrl : undefined;
}
