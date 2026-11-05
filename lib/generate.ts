import Anthropic from "@anthropic-ai/sdk";
import { parseBriefText, type ParsedBrief } from "./briefText";
import { buildUserContent, SYSTEM_PROMPT, type BriefMeta } from "./prompts";
import type { Segment } from "./types";

export const MODEL = "claude-opus-5-5";

export type GenerationResult = { brief: ParsedBrief; segments: Segment[] };

let client: Anthropic | null = null;

// Lazily creates the Anthropic client (reads ANTHROPIC_API_KEY from the environment).
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

// Keeps each text block with the document passages the API attached to it.
function toSegments(content: Anthropic.Beta.BetaContentBlock[]): Segment[] {
  return content.flatMap((block) => {
    if (block.type !== "text") return [];
    const citations = (block.citations ?? []).flatMap((c) =>
      c.type === "page_location" ? [{ cited_text: c.cited_text, start_page: c.start_page_number, end_page: c.end_page_number }] : [],
    );
    return [{ text: block.text, citations }];
  });
}

// Asks Claude for a brief grounded in the PDF, with citations extracted by the API (not written by the model).
export async function generateBrief(meta: BriefMeta, pdfBase64: string): Promise<GenerationResult> {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserContent(meta, pdfBase64) }],
  });
  if (response.stop_reason === "refusal") throw new Error("Model refused to write the brief");
  if (response.stop_reason === "max_tokens") throw new Error("Brief truncated (max_tokens reached)");
  const segments = toSegments(response.content);
  return { brief: parseBriefText(segments.map((s) => s.text).join("")), segments };
}
