import { useEffect, useState } from "react";
import { type ResolvedLesson } from "../data/curriculum";
import { mediaAssetStem } from "../data/curriculum";
import {
  infographicSlides,
  podcastPathCandidates,
  publicAssetExamples,
  questionnairePathCandidates,
  videoPathCandidates,
} from "../utils/mediaPaths";
import { assetUrl } from "../utils/assetUrl";
import { InfographicGallery } from "./InfographicGallery";
import { MediaBlock } from "./MediaBlock";
import { MediaTabs, type MediaTabId } from "./MediaTabs";
import { MediaWithFallback } from "./MediaWithFallback";
import { Questionnaire } from "./Questionnaire";

type Props = { lesson: ResolvedLesson };

export function LessonContent({ lesson }: Props) {
  const { system, section, topic, assetCode, questionnairePath } = lesson;
  const stem = mediaAssetStem(assetCode);
  const title = topic?.title ?? section.title;
  const breadcrumb = topic ? `${system.title} › ${section.title}` : system.title;
  const publicFiles = publicAssetExamples(stem);

  const [tab, setTab] = useState<MediaTabId>("video");

  useEffect(() => {
    setTab("video");
  }, [assetCode]);

  const videoPaths = videoPathCandidates(assetCode);
  const audioPaths = podcastPathCandidates(assetCode);
  const imagePaths = infographicSlides(assetCode);
  const qPaths = questionnairePathCandidates(assetCode, questionnairePath);

  const videoKey = videoPaths.map((p) => assetUrl(p)).join("|");
  const audioKey = audioPaths.map((p) => assetUrl(p)).join("|");
  const imageKey = imagePaths.map((p) => assetUrl(p)).join("|");
  const qKey = qPaths.map((p) => assetUrl(p)).join("|");

  return (
    <div className="lesson-view">
      <header className="subchapter-head">
        <p className="eyebrow">{breadcrumb}</p>
        <h2 className="lesson-stem">{stem}</h2>
        <p className="lesson-subtitle">{title}</p>
        <p className="lesson-files muted small">
          Ficheiros em <code>public/</code>:{" "}
          {publicFiles.map((name, i) => (
            <span key={name}>
              {i > 0 ? ", " : null}
              <code>{name}</code>
            </span>
          ))}
        </p>
      </header>

      <MediaTabs active={tab} onChange={setTab} />

      <div
        className="media-stage"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "video" ? (
          <MediaBlock key={`${assetCode}-v`} urlKey={videoKey} bare>
            {({ onMissing }) => (
              <MediaWithFallback
                paths={videoPaths}
                urlKey={videoKey}
                onExhausted={onMissing}
                render={({ src, onError }) => (
                  <video
                    className="video"
                    controls
                    preload="metadata"
                    src={src}
                    onError={onError}
                  />
                )}
              />
            )}
          </MediaBlock>
        ) : null}

        {tab === "podcast" ? (
          <MediaBlock key={`${assetCode}-p`} urlKey={audioKey} bare>
            {({ onMissing }) => (
              <MediaWithFallback
                paths={audioPaths}
                urlKey={audioKey}
                onExhausted={onMissing}
                render={({ src, onError }) => (
                  <audio className="audio" controls preload="metadata" src={src} onError={onError}>
                    Podcast
                  </audio>
                )}
              />
            )}
          </MediaBlock>
        ) : null}

        {tab === "infographic" ? (
          <MediaBlock key={`${assetCode}-i`} urlKey={imageKey} bare>
            {({ onMissing }) => (
              <InfographicGallery
                paths={imagePaths}
                urlKey={imageKey}
                title={title}
                onMissing={onMissing}
              />
            )}
          </MediaBlock>
        ) : null}

        {tab === "questions" ? (
          <div key={`${assetCode}-q`} className="media-panel media-panel--questions">
            <Questionnaire paths={qPaths} urlKey={qKey} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
