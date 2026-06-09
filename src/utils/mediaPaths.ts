import { mediaAssetStem } from "../data/curriculum";

function stemsFor(assetCode: string): string[] {
  const mapped = mediaAssetStem(assetCode);
  return mapped === assetCode ? [assetCode] : [mapped, assetCode];
}

function unique(paths: string[]): string[] {
  return [...new Set(paths)];
}

export function videoPathCandidates(assetCode: string): string[] {
  return unique(
    stemsFor(assetCode).flatMap((stem) => [`/${stem}_Vx.mp4`, `/${stem}_V.mp4`]),
  );
}

export function podcastPathCandidates(assetCode: string): string[] {
  return unique(stemsFor(assetCode).map((stem) => `/${stem}_P.m4a`));
}

export function infographicPathCandidates(assetCode: string): string[] {
  return unique(
    stemsFor(assetCode).flatMap((stem) => [
      `/${stem}_I.png`,
      `/${stem}.png`,
      `/${stem}_II.png`,
    ]),
  );
}

export function questionnairePathCandidates(
  assetCode: string,
  override?: string,
): string[] {
  if (override) return [override];
  return unique(stemsFor(assetCode).map((stem) => `/${stem}_Q.csv`));
}

/** Example filenames under `public/` for a lesson stem (for UI / debugging). */
export function publicAssetExamples(stem: string): string[] {
  return [
    `${stem}_Vx.mp4`,
    `${stem}_P.m4a`,
    `${stem}_I.png`,
    `${stem}_II.png`,
    `${stem}_Q.csv`,
  ];
}
