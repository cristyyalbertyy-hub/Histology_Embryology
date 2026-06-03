import { type System } from "../data/curriculum";
import { assetUrl } from "../utils/assetUrl";

type Props = {
  system: System;
};

export function ChapterOverview({ system }: Props) {
  const src = assetUrl(system.overviewImage!);

  return (
    <div className="overview-panel chapter-overview">
      <header className="chapter-overview-head">
        <p className="eyebrow">Chapter</p>
        <h2>{system.title}</h2>
      </header>
      <img
        src={src}
        alt={`${system.title} — chapter overview`}
        className="overview-infographic"
      />
      <p className="overview-hint muted">
        Choose a sub-topic in the menu to open video, podcast, infographic, and questionnaire.
      </p>
    </div>
  );
}
