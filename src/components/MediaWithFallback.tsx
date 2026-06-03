import { useEffect, useState, type ReactNode } from "react";
import { assetUrl } from "../utils/assetUrl";

type Props = {
  paths: string[];
  urlKey: string;
  render: (props: { src: string; onError: () => void }) => ReactNode;
  onExhausted: () => void;
};

export function MediaWithFallback({ paths, urlKey, render, onExhausted }: Props) {
  const [index, setIndex] = useState(0);
  const src = assetUrl(paths[index] ?? paths[0]);

  useEffect(() => {
    setIndex(0);
  }, [urlKey]);

  const handleError = () => {
    if (index < paths.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    onExhausted();
  };

  return <>{render({ src, onError: handleError })}</>;
}
