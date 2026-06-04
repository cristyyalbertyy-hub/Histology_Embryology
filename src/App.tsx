import { useEffect, useMemo, useRef, useState } from "react";
import { ChapterOverview } from "./components/ChapterOverview";
import { CourseNav, useLessonFromSelection, type LessonSelection } from "./components/CourseNav";
import { LessonContent } from "./components/LessonContent";
import { courseTitle, systemById, systems } from "./data/curriculum";
import { assetUrl } from "./utils/assetUrl";

function collapsedRecord(ids: string[]): Record<string, boolean> {
  const init: Record<string, boolean> = {};
  for (const id of ids) init[id] = false;
  return init;
}

export default function App() {
  const [openSystems, setOpenSystems] = useState(() =>
    collapsedRecord(systems.map((s) => s.id)),
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [selection, setSelection] = useState<LessonSelection | null>(null);
  const [atHome, setAtHome] = useState(true);
  const [chapterBrowseId, setChapterBrowseId] = useState<string | null>(null);
  const [chapterViewRevision, setChapterViewRevision] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  const lesson = useMemo(() => useLessonFromSelection(selection), [selection]);
  const chapterSystem = chapterBrowseId ? systemById(chapterBrowseId) : undefined;
  const showChapterOverview =
    !atHome && !lesson && chapterBrowseId != null && chapterSystem?.overviewImage != null;
  const isBrowsing = !lesson && !atHome && !showChapterOverview;

  const dismissChapterOverview = () => setChapterBrowseId(null);

  const overviewImage = assetUrl("/Infographic.png");

  const overviewPanel = (
    <div className="overview-panel">
      <img
        src={overviewImage}
        alt="Histology And Embryology — course overview"
        className="overview-infographic"
      />
      <p className="overview-hint muted">
        Use the menu on the left to open a chapter and choose a sub-topic.
      </p>
    </div>
  );

  const closeChapterSections = (systemId: string) => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${systemId}:`)) delete next[key];
      }
      return next;
    });
  };

  const exploreChapter = (id: string) => {
    const sys = systemById(id);
    if (!sys?.overviewImage) return;

    setSelection(null);
    setAtHome(false);
    setOpenSystems((o) => ({ ...o, [id]: true }));
    setChapterBrowseId(id);
    setChapterViewRevision((r) => r + 1);
  };

  const toggleSystem = (id: string) => {
    const sys = systemById(id);
    if (sys?.overviewImage) {
      const isOpen = openSystems[id] ?? false;
      const showingOverview =
        chapterBrowseId === id && !lesson && !atHome;

      if (isOpen && showingOverview) {
        setOpenSystems((o) => ({ ...o, [id]: false }));
        closeChapterSections(id);
        dismissChapterOverview();
        if (!selection) setAtHome(true);
        return;
      }

      exploreChapter(id);
      return;
    }

    dismissChapterOverview();
    const willOpen = !(openSystems[id] ?? false);
    setOpenSystems((o) => ({ ...o, [id]: willOpen }));
    if (!selection) setAtHome(false);
  };

  const toggleSection = (key: string) => {
    dismissChapterOverview();
    setOpenSections((o) => ({ ...o, [key]: !o[key] }));
    if (!selection) setAtHome(false);
  };

  const selectLesson = (sel: LessonSelection) => {
    dismissChapterOverview();
    setAtHome(false);
    setSelection(sel);

    const nextSystems = collapsedRecord(systems.map((s) => s.id));
    nextSystems[sel.systemId] = true;
    setOpenSystems(nextSystems);

    const sectionKey = `${sel.systemId}:${sel.sectionId}`;
    if (sel.topicId !== null) {
      setOpenSections({ [sectionKey]: true });
    } else {
      setOpenSections({});
    }
  };

  const lessonScrollKey = lesson
    ? `${lesson.system.id}:${lesson.section.id}:${lesson.topic?.id ?? ""}:${lesson.assetCode}`
    : null;
  const mainScrollKey = lessonScrollKey ?? (chapterBrowseId ? `${chapterBrowseId}:${chapterViewRevision}` : null);

  useEffect(() => {
    if (!mainScrollKey) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mainScrollKey]);

  const goToEntry = () => {
    setAtHome(true);
    setSelection(null);
    setChapterBrowseId(null);
    setOpenSystems(collapsedRecord(systems.map((s) => s.id)));
    setOpenSections({});
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          type="button"
          className="home-thumb"
          onClick={goToEntry}
          aria-label="Back to course overview"
          title="Course overview"
        >
          <img src={overviewImage} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
          <span className="home-thumb-fallback" aria-hidden>
            ⊕
          </span>
        </button>
        <h1>{courseTitle}</h1>
      </header>

      <div className="layout">
        <CourseNav
          openSystems={openSystems}
          openSections={openSections}
          selection={selection}
          onToggleSystem={toggleSystem}
          onToggleSection={toggleSection}
          onSelectLesson={selectLesson}
        />

        <main
          ref={mainRef}
          className={`main${atHome || showChapterOverview ? " main--overview" : ""}${isBrowsing ? " main--browsing" : ""}`}
        >
          {atHome ? (
            overviewPanel
          ) : showChapterOverview && chapterSystem ? (
            <ChapterOverview
              key={`${chapterBrowseId}-${chapterViewRevision}`}
              system={chapterSystem}
            />
          ) : lesson ? (
            <LessonContent lesson={lesson} />
          ) : (
            <div className="browse-view">
              <div className="media-stage media-stage--placeholder">
                <p>Choose a sub-topic in the menu (for example <code>EC_ECO</code>).</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
