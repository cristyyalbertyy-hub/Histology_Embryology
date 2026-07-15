import { useEffect, useMemo, useRef, useState } from "react";
import { ChapterOverview } from "./components/ChapterOverview";
import { CourseNav, useLessonFromSelection, type LessonSelection } from "./components/CourseNav";
import { LessonContent } from "./components/LessonContent";
import { LockedChapterPanel } from "./components/LockedChapterPanel";
import { useAuth } from "./context/AuthContext";
import { systemById, systems } from "./data/curriculum";
import { resolveAppTitle, resolveOverviewImage, resolveOverviewLead } from "./lib/packageAccess";
import { assetUrl } from "./utils/assetUrl";

function collapsedRecord(ids: string[]): Record<string, boolean> {
  const init: Record<string, boolean> = {};
  for (const id of ids) init[id] = false;
  return init;
}

export default function App() {
  const { hasChapterAccess, hasFullAccess, ownedPackageIds, launchPackageId, userEmail, logout } = useAuth();
  const [openSystems, setOpenSystems] = useState(() =>
    collapsedRecord(systems.map((s) => s.id)),
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [selection, setSelection] = useState<LessonSelection | null>(null);
  const [atHome, setAtHome] = useState(true);
  const [chapterBrowseId, setChapterBrowseId] = useState<string | null>(null);
  const [lockedChapterId, setLockedChapterId] = useState<string | null>(null);
  const [chapterViewRevision, setChapterViewRevision] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  const lesson = useMemo(() => useLessonFromSelection(selection), [selection]);
  const chapterSystem = chapterBrowseId ? systemById(chapterBrowseId) : undefined;
  const showChapterOverview =
    !atHome && !lesson && chapterBrowseId != null && chapterSystem?.overviewImage != null;
  const isBrowsing = !lesson && !atHome && !showChapterOverview;

  const activeSystemId = useMemo(() => {
    if (lesson) return lesson.system.id;
    if (chapterBrowseId) return chapterBrowseId;
    if (selection && !atHome) return selection.systemId;
    return systems.find((s) => openSystems[s.id])?.id ?? null;
  }, [lesson, chapterBrowseId, selection, atHome, openSystems]);

  const browsingContext = useMemo(() => {
    if (!selection || lesson) return null;
    const system = systems.find((s) => s.id === selection.systemId);
    const section = system?.sections.find((sec) => sec.id === selection.sectionId);
    if (!system || !section) return null;
    return { system, section };
  }, [selection, lesson]);

  const mobileLessonContext = useMemo(() => {
    if (lesson) {
      return {
        chapter: lesson.system.title,
        subchapter: lesson.topic?.title ?? lesson.section.title,
        color: lesson.system.color,
      };
    }
    if (showChapterOverview && chapterSystem) {
      return {
        chapter: chapterSystem.title,
        subchapter: "Chapter overview",
        color: chapterSystem.color,
      };
    }
    if (browsingContext) {
      return {
        chapter: browsingContext.system.title,
        subchapter: browsingContext.section.title,
        color: browsingContext.system.color,
      };
    }
    return null;
  }, [lesson, showChapterOverview, chapterSystem, browsingContext]);

  const showMobileLessonBar = !mobileMenuOpen && !atHome && mobileLessonContext !== null;
  const shellMode = mobileMenuOpen ? "is-mobile-menu" : "is-mobile-content";
  const appTitle = useMemo(
    () => resolveAppTitle(ownedPackageIds, launchPackageId),
    [ownedPackageIds, launchPackageId],
  );
  const overviewLead = useMemo(
    () => resolveOverviewLead(ownedPackageIds, launchPackageId),
    [ownedPackageIds, launchPackageId],
  );
  const overviewImage = useMemo(
    () => assetUrl(resolveOverviewImage(ownedPackageIds, launchPackageId)),
    [ownedPackageIds, launchPackageId],
  );
  const visibleSystems = useMemo(
    () => systems.filter((system) => hasChapterAccess(system.id)),
    [hasChapterAccess],
  );

  const dismissChapterOverview = () => setChapterBrowseId(null);

  const overviewPanel = (
    <div className="overview-panel">
      <div className="overview-intro">
        <p className="overview-lead">{overviewLead}</p>
        <ul className="overview-systems" aria-label="Course chapters">
          {visibleSystems.map((system) => (
            <li
              key={system.id}
              className="overview-systems__item"
              style={{ borderLeftColor: system.color }}
            >
              <strong>{system.title}</strong>
              <span>
                {system.sections.length}{" "}
                {system.sections.length === 1 ? "section" : "sections"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <img
        src={overviewImage}
        alt={`${appTitle} — course overview`}
        className="overview-infographic"
      />
      <p className="overview-hint muted">
        Open a coloured chapter below, then choose a sub-topic to start.
      </p>
      <button type="button" className="mobile-browse-btn" onClick={() => setMobileMenuOpen(true)}>
        Browse chapters →
      </button>
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
    if (!hasChapterAccess(id)) {
      setSelection(null);
      setAtHome(false);
      setMobileMenuOpen(false);
      setChapterBrowseId(null);
      setLockedChapterId(id);
      return;
    }

    const sys = systemById(id);
    if (!sys?.overviewImage) return;

    setLockedChapterId(null);
    setSelection(null);
    setAtHome(false);
    setMobileMenuOpen(false);
    setOpenSystems((o) => ({ ...o, [id]: true }));
    setChapterBrowseId(id);
    setChapterViewRevision((r) => r + 1);
  };

  const toggleSystem = (id: string) => {
    const sys = systemById(id);
    if (sys?.overviewImage) {
      const isOpen = openSystems[id] ?? false;
      const showingOverview = chapterBrowseId === id && !lesson && !atHome;

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
    if (!hasChapterAccess(sel.systemId)) {
      setLockedChapterId(sel.systemId);
      setAtHome(false);
      setSelection(null);
      setChapterBrowseId(null);
      setMobileMenuOpen(false);
      return;
    }

    dismissChapterOverview();
    setLockedChapterId(null);
    setAtHome(false);
    setSelection(sel);
    setMobileMenuOpen(false);

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
  const mainScrollKey =
    lessonScrollKey ?? (chapterBrowseId ? `${chapterBrowseId}:${chapterViewRevision}` : null);

  useEffect(() => {
    if (!mainScrollKey) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mainScrollKey]);

  const goToEntry = () => {
    setAtHome(true);
    setSelection(null);
    setChapterBrowseId(null);
    setLockedChapterId(null);
    setMobileMenuOpen(false);
    setOpenSystems(collapsedRecord(systems.map((s) => s.id)));
    setOpenSections({});
  };

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  return (
    <div className={`app-shell ${shellMode}`}>
      <header className={`app-header${showMobileLessonBar ? " app-header--compact-mobile" : ""}`}>
        <button
          type="button"
          className="home-overview-btn"
          onClick={goToEntry}
          aria-label="Back to course overview"
        >
          <span className="home-overview-btn__media">
            <img src={overviewImage} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
            <span className="home-overview-btn__fallback" aria-hidden>
              ⊕
            </span>
          </span>
          <span className="home-overview-btn__label">Course overview</span>
        </button>
        <h1>{appTitle}</h1>
        {userEmail ? (
          <div className="app-header__actions">
            <div className="auth-account">
              <span className="auth-account__email" title={userEmail}>
                {userEmail}
              </span>
              <button type="button" className="btn-ghost" onClick={() => void logout()}>
                Sair
              </button>
            </div>
          </div>
        ) : null}
      </header>

      {showMobileLessonBar && mobileLessonContext ? (
        <div
          className="mobile-lesson-bar"
          style={{ borderLeftColor: mobileLessonContext.color }}
        >
          <button type="button" className="mobile-menu-back" onClick={openMobileMenu}>
            ← Menu
          </button>
          <div className="mobile-lesson-bar__text">
            <span className="mobile-lesson-bar__chapter">{mobileLessonContext.chapter}</span>
            <span className="mobile-lesson-bar__sub">{mobileLessonContext.subchapter}</span>
          </div>
        </div>
      ) : null}

      <div className="layout">
        <div className="sidebar-column">
          <CourseNav
            openSystems={openSystems}
            openSections={openSections}
            selection={selection}
            hasChapterAccess={hasChapterAccess}
            onToggleSystem={toggleSystem}
            onToggleSection={toggleSection}
            onSelectLesson={selectLesson}
            hideLockedChapters={!hasFullAccess}
            onLockedChapter={(id) => {
              setLockedChapterId(id);
              setAtHome(false);
              setSelection(null);
              setChapterBrowseId(null);
              setMobileMenuOpen(false);
            }}
          />
        </div>

        <main
          ref={mainRef}
          className={`main${atHome || showChapterOverview ? " main--overview" : ""}${isBrowsing ? " main--browsing" : ""}`}
          data-system-tint={activeSystemId ?? undefined}
        >
          {atHome ? (
            overviewPanel
          ) : lockedChapterId ? (
            <LockedChapterPanel
              chapterId={lockedChapterId}
              chapterTitle={systemById(lockedChapterId)?.title ?? lockedChapterId}
            />
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
                {browsingContext ? (
                  <>
                    <p className="eyebrow">{browsingContext.system.title}</p>
                    <h2 className="browse-title">{browsingContext.section.title}</h2>
                    <p className="browse-hint">
                      Pick a sub-topic in the menu to open video, podcast, infographic and questions.
                    </p>
                  </>
                ) : (
                  <p>Choose a coloured chapter in the menu on the left, then select a sub-topic.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
