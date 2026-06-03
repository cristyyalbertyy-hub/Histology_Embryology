import { useEffect, useState } from "react";
import { assetUrl } from "../utils/assetUrl";
import { parseCsvRows } from "../utils/parseCsv";

type Props = { paths: string[]; urlKey: string };

export function Questionnaire({ paths, urlKey }: Props) {
  const [items, setItems] = useState<{ question: string; answer: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);

    (async () => {
      let lastError = "Could not load questionnaire.";
      for (const path of paths) {
        try {
          const r = await fetch(assetUrl(path));
          if (!r.ok) {
            lastError = `Could not load questionnaire (${r.status}).`;
            continue;
          }
          const text = await r.text();
          if (cancelled) return;
          setItems(parseCsvRows(text));
          return;
        } catch (e: unknown) {
          lastError = e instanceof Error ? e.message : "Failed to load.";
        }
      }
      if (!cancelled) setError(lastError);
    })();

    return () => {
      cancelled = true;
    };
  }, [urlKey, paths]);

  if (error) return <p className="muted">{error}</p>;
  if (!items) return <p className="muted">Loading questions…</p>;
  if (items.length === 0) return <p className="muted">No questions in this file.</p>;

  return (
    <ul className="q-list">
      {items.map((it, idx) => (
        <li key={idx} className="q-item">
          <button
            type="button"
            className="q-toggle"
            onClick={() => setOpen((o) => ({ ...o, [idx]: !o[idx] }))}
            aria-expanded={!!open[idx]}
          >
            <span className="q-num">{idx + 1}.</span>
            <span className="q-text">{it.question}</span>
            <span className="q-chevron" aria-hidden>
              {open[idx] ? "▼" : "▶"}
            </span>
          </button>
          {open[idx] ? (
            <div className="q-answer">
              <span className="q-answer-label">Answer</span>
              <p>{it.answer}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
