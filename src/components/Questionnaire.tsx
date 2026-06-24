import { useEffect, useState } from "react";
import { assetUrl } from "../utils/assetUrl";
import { parseCsvRows } from "../utils/parseCsv";

type Props = { paths: string[]; urlKey: string };

export function Questionnaire({ paths, urlKey }: Props) {
  const [items, setItems] = useState<{ question: string; answer: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    setIndex(0);
    setRevealed(false);

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

  const card = items[index]!;
  const atStart = index === 0;
  const atEnd = index >= items.length - 1;

  const goPrevious = () => {
    if (atStart) return;
    setIndex((i) => i - 1);
    setRevealed(false);
  };

  const goNext = () => {
    if (atEnd) return;
    setIndex((i) => i + 1);
    setRevealed(false);
  };

  return (
    <div className="questionnaire">
      <p className="questionnaire__progress">
        Question {index + 1} of {items.length}
      </p>

      <div className="questionnaire__nav-row">
        <button
          type="button"
          className="questionnaire__arrow"
          onClick={goPrevious}
          disabled={atStart}
          aria-label="Previous question"
        >
          ←
        </button>

        <div className="questionnaire__card">
          <p className="questionnaire__question">{card.question}</p>
          {revealed ? (
            <div className="questionnaire__answer">
              <span className="questionnaire__answer-label">Answer</span>
              <p>{card.answer}</p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="questionnaire__arrow"
          onClick={goNext}
          disabled={atEnd}
          aria-label="Next question"
        >
          →
        </button>
      </div>

      {!revealed ? (
        <button type="button" className="questionnaire__reveal" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      ) : null}
    </div>
  );
}
