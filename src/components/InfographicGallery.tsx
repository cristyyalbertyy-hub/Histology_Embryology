import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../utils/assetUrl";
import { isMediaUrl } from "../utils/isMediaUrl";

type Props = {
  paths: string[];
  urlKey: string;
  title: string;
  onMissing: () => void;
};

export function InfographicGallery({ paths, urlKey, title, onMissing }: Props) {
  const [slides, setSlides] = useState<string[] | null>(null);
  const onMissingRef = useRef(onMissing);
  onMissingRef.current = onMissing;

  useEffect(() => {
    let cancelled = false;
    setSlides(null);

    (async () => {
      const found: string[] = [];
      for (const path of paths) {
        if (cancelled) return;
        if (await isMediaUrl(path)) found.push(path);
      }
      if (cancelled) return;
      if (found.length === 0) onMissingRef.current();
      else setSlides(found);
    })();

    return () => {
      cancelled = true;
    };
  }, [urlKey, paths]);

  if (!slides) return null;

  return (
    <div className="infographic-gallery">
      {slides.map((path, index) => (
        <figure key={path} className="infographic-slide">
          {slides.length > 1 ? (
            <figcaption className="infographic-label muted small">
              Infográfico {index + 1} de {slides.length}
            </figcaption>
          ) : null}
          <img
            className="infographic"
            src={assetUrl(path)}
            alt={`Infographic ${index + 1}: ${title}`}
          />
        </figure>
      ))}
    </div>
  );
}
