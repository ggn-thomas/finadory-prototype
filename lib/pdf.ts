import { extractText, getDocumentProxy } from "unpdf";

const ALLOWED_HOSTS = new Set(["fr.ftp.opendatasoft.com"]);
const MAX_BYTES = 32 * 1024 * 1024;
const TIMEOUT_MS = 30_000;

export type SourcePdf = { base64: string; text: string; totalPages: number };

// Rejects anything but an https URL on the official AMF/DILA file host.
function assertAllowedUrl(url: string): void {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`Refused source URL (not an allowed https host): ${url}`);
  }
}

// Reads the response body while enforcing MAX_BYTES, even when Content-Length is missing or wrong.
async function readCapped(response: Response): Promise<Uint8Array> {
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new Error(`PDF too large (${declared} bytes)`);
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
    total += chunk.length;
    if (total > MAX_BYTES) throw new Error(`PDF too large (over ${MAX_BYTES} bytes)`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Downloads an allowed PDF (https host allowlist, no redirect, timeout, size cap, PDF content type).
async function downloadPdf(url: string): Promise<Uint8Array> {
  assertAllowedUrl(url);
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok || !response.body) throw new Error(`PDF download failed (${response.status}): ${url}`);
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("application/pdf")) throw new Error(`Not a PDF (content-type: ${type}): ${url}`);
  return readCapped(response);
}

// Downloads a PDF once: base64 for Claude (citations) and the full extracted text for verification.
export async function fetchSourcePdf(url: string): Promise<SourcePdf> {
  const bytes = await downloadPdf(url);
  const base64 = Buffer.from(bytes).toString("base64");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return { base64, text, totalPages };
}
