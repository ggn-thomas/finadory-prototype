import { extractText, getDocumentProxy } from "unpdf";

export type SourcePdf = { base64: string; text: string; totalPages: number };

// Downloads a PDF once: base64 for Claude (citations) and the full extracted text for verification.
export async function fetchSourcePdf(url: string): Promise<SourcePdf> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PDF download failed (${response.status}): ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const base64 = Buffer.from(bytes).toString("base64");
  const pdf = await getDocumentProxy(bytes.slice());
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return { base64, text, totalPages };
}
