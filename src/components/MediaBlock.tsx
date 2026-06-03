import { useEffect, useState, type ReactNode } from "react";

type Props = {
  label?: string;
  description?: string;
  urlKey?: string;
  bare?: boolean;
  children: (props: { onMissing: () => void }) => ReactNode;
};

export function MediaBlock({ label, description, urlKey, bare, children }: Props) {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setMissing(false);
  }, [urlKey]);

  return (
    <section className={bare ? "media-panel" : "media-block"}>
      {!bare && label ? (
        <header className="media-block-head">
          <h3>{label}</h3>
          {description ? <p className="muted small">{description}</p> : null}
        </header>
      ) : null}
      {missing ? (
        <div className="missing-box">
          <p>No file is available for this section yet.</p>
          <p className="muted small">
            Expected under <code>public/</code>
            {urlKey ? (
              <>
                {" "}
                (for example <code>{urlKey.split("|")[0]?.replace(/^\//, "")}</code>)
              </>
            ) : null}
            .
          </p>
        </div>
      ) : (
        children({ onMissing: () => setMissing(true) })
      )}
    </section>
  );
}
