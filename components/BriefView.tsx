import Link from "next/link";
import type { Brief } from "@/lib/briefs";
import { formatParis } from "@/lib/dates";
import { stagger } from "@/lib/motion";
import { FiguresTable } from "./FiguresTable";

const chip = "inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-xs text-muted";
const MIN_WORDS = 100;
const MAX_WORDS = 150;

// Verification badge: accent when every figure was found in its cited passage, a warning otherwise.
function VerificationBadge({ brief }: { brief: Brief }) {
  const verified = brief.figures.filter((f) => f.status === "verified").length;
  const total = brief.figures.length;
  if (brief.status === "verified") {
    return (
      <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-bg">
        ✓ {verified}/{total} chiffres vérifiés dans le document source
      </span>
    );
  }
  const label = brief.status === "unverified" ? "✗ Chiffre(s) introuvable(s) dans le PDF" : "⚠ Chiffre(s) à vérifier";
  return (
    <span className="inline-flex rounded-full border border-text px-3 py-1 text-xs font-medium">
      {label} · {verified}/{total} vérifiés
    </span>
  );
}

// Title block: back link, label, title, source line and verification badge.
function BriefHeader({ brief }: { brief: Brief }) {
  const { publication } = brief;
  return (
    <header style={stagger(0)} className="animate-fade-up border-b border-line pt-8 pb-8">
      <Link href="/" className="text-sm text-muted hover:text-text">
        ← Retour aux publications
      </Link>
      <p className="mt-8">
        <span className={chip}>Sociétés cotées</span>
      </p>
      <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">{brief.title}</h1>
      <p className="mt-4 text-sm text-muted">
        {publication.company_name} · publié le {formatParis(publication.published_at)} ·{" "}
        <a href={publication.url} target="_blank" rel="noreferrer" className="underline hover:text-text">
          document source (PDF) ↗
        </a>
      </p>
      <div className="mt-6">
        <VerificationBadge brief={brief} />
      </div>
    </header>
  );
}

// Full brief: chapô, body, key facts, why it was selected, and the figure-by-figure verification.
export function BriefView({ brief }: { brief: Brief }) {
  const lengthOk = brief.word_count >= MIN_WORDS && brief.word_count <= MAX_WORDS;
  return (
    <article className="max-w-3xl">
      <BriefHeader brief={brief} />
      <p style={stagger(1)} className="animate-fade-up mt-8 font-serif text-xl leading-relaxed">{brief.chapo}</p>
      <div style={stagger(2)} className="animate-fade-up mt-6 space-y-4 leading-relaxed text-text/90">
        {brief.body.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      <section style={stagger(3)} className="animate-fade-up mt-8 border border-line p-5">
        <h2 className="font-serif text-xl">Faits clés</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {brief.key_facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </section>
      {!lengthOk && (
        <p className="mt-4 text-xs text-muted">
          ⚠ Longueur : {brief.word_count} mots (consigne : {MIN_WORDS} à {MAX_WORDS}).
        </p>
      )}
      <details style={stagger(5)} className="animate-fade-up group mt-8">
        <summary className="cursor-pointer list-none font-serif text-xl hover:text-accent">
          <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
          Chiffres et sources ({brief.figures.length})
        </summary>
        <div className="mt-4">
          <FiguresTable figures={brief.figures} />
        </div>
      </details>
      <p className="mt-10 text-xs text-muted">
        Rédigée par {brief.model} (prompt {brief.prompt_version}) à partir du seul document source, via l&apos;API
        Citations ; chaque chiffre est recherché dans le passage cité pour sa phrase.
      </p>
    </article>
  );
}
