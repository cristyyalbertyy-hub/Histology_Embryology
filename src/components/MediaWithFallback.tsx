import { useEffect, useState, type ReactNode } from "react";
import { assetUrl } from "../utils/assetUrl";
import { isMediaUrl } from "../utils/isMediaUrl";

type Props = {
  paths: string[];
  urlKey: string;
  render: (props: { src: string; onError: () => void }) => ReactNode;
  onExhausted: () => void;
};

export function MediaWithFallback({ paths, urlKey, render, onExhausted }: Props) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIndex(0);
    setReady(false);

    (async () => {
      for (let i = 0; i < paths.length; i++) {
        if (cancelled) return;
        if (await isMediaUrl(paths[i])) {
          setIndex(i);
          setReady(true);
          return;
        }
      }
      if (!cancelled) onExhausted();
    })();

    return () => {
      cancelled = true;
    };
  }, [urlKey]);

  const src = assetUrl(paths[index] ?? paths[0]);

  const handleError = () => {
    const next = index + 1;
    if (next < paths.length) {
      setIndex(next);
      return;
    }
    setReady(false);
    onExhausted();
  };

  if (!ready) return null;

  return <>{render({ src, onError: handleError })}</>;
}
