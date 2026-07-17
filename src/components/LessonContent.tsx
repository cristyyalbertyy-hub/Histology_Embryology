import { useEffect, useRef, useState } from "react";
import { type ResolvedLesson } from "../data/curriculum";
import {
  infographicSlides,
  podcastPathCandidates,
  questionnairePathCandidates,
  videoPathCandidates,
} from "../utils/mediaPaths";
import { assetUrl } from "../utils/assetUrl";
import { useMediaProgress } from "../hooks/useMediaProgress";
import { bindPlaybackProgress } from "../lib/playbackProgress";
import { InfographicGallery } from "./InfographicGallery";
import { MediaBlock } from "./MediaBlock";
import { MediaTabs, type MediaTabId } from "./MediaTabs";
import { MediaWithFallback } from "./MediaWithFallback";
import { Questionnaire } from "./Questionnaire";

type Props = { lesson: ResolvedLesson };

export function LessonContent({ lesson }: Props) {
  const { system, section, topic, assetCode, questionnairePath } = lesson;
  const title = topic?.title ?? section.title;
  const breadcrumb = topic ? `${system.title} › ${section.title}` : system.title;
  const progressItemKey = topic?.id ?? section.id;

  const [tab, setTab] = useState<MediaTabId>("video");
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { trackWatchComplete } = useMediaProgress(progressItemKey, system.id);

  useEffect(() => {
    setTab("video");
  }, [assetCode]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || tab !== "video") return;
    return bindPlaybackProgress(el, () => void trackWatchComplete("V"));
  }, [tab, assetCode, trackWatchComplete]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || tab !== "podcast") return;
    return bindPlaybackProgress(el, () => void trackWatchComplete("P"));
  }, [tab, assetCode, trackWatchComplete]);

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
        <h2>{title}</h2>
      </header>

      <MediaTabs active={tab} onChange={setTab} />

      <div
        className="media-stage"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        onContextMenu={(event) => event.preventDefault()}
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
                    ref={videoRef}
                    className="video"
                    controls
                    controlsList="nodownload"
                    playsInline
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
                  <audio
                    ref={audioRef}
                    className="audio"
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                    src={src}
                    onError={onError}
                  >
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
