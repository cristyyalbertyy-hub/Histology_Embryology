import {
  courseTitle,
  resolveLesson,
  sectionHasTopics,
  systems,
  type Section,
  type System,
  type Topic,
} from "../data/curriculum";

export type LessonSelection = {
  systemId: string;
  sectionId: string;
  topicId: string | null;
};

type Props = {
  openSystems: Record<string, boolean>;
  openSections: Record<string, boolean>;
  selection: LessonSelection | null;
  onToggleSystem: (id: string) => void;
  onToggleSection: (key: string) => void;
  onSelectLesson: (sel: LessonSelection) => void;
};

function sectionKey(systemId: string, sectionId: string): string {
  return `${systemId}:${sectionId}`;
}

function LessonCard({
  title,
  code,
  active,
  variant = "topic",
  onClick,
}: {
  title: string;
  code: string;
  active: boolean;
  variant?: "topic" | "section-leaf";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`lesson-card lesson-card--${variant}${active ? " active" : ""}`}
      onClick={onClick}
    >
      <span className="lesson-card-body">
        <span className="lesson-card-title">{title}</span>
        <span className="lesson-card-code">{code}</span>
      </span>
      <span className="lesson-card-arrow" aria-hidden>
        ›
      </span>
    </button>
  );
}

function TopicItem({
  system,
  section,
  topic,
  selection,
  onSelectLesson,
}: {
  system: System;
  section: Section;
  topic: Topic;
  selection: LessonSelection | null;
  onSelectLesson: (sel: LessonSelection) => void;
}) {
  const active =
    selection?.systemId === system.id &&
    selection.sectionId === section.id &&
    selection.topicId === topic.id;

  return (
    <li className="nav-topic-item">
      <LessonCard
        title={topic.title}
        code={topic.assetCode}
        active={active}
        onClick={() =>
          onSelectLesson({
            systemId: system.id,
            sectionId: section.id,
            topicId: topic.id,
          })
        }
      />
    </li>
  );
}

function SectionBlock({
  system,
  section,
  openSections,
  selection,
  onToggleSection,
  onSelectLesson,
}: {
  system: System;
  section: Section;
  openSections: Record<string, boolean>;
  selection: LessonSelection | null;
  onToggleSection: (key: string) => void;
  onSelectLesson: (sel: LessonSelection) => void;
}) {
  const key = sectionKey(system.id, section.id);
  const hasTopics = sectionHasTopics(section);
  const open = openSections[key] ?? false;

  const isLeafActive =
    !hasTopics &&
    selection?.systemId === system.id &&
    selection.sectionId === section.id &&
    selection.topicId === null;

  if (!hasTopics && section.assetCode) {
    return (
      <li className="nav-section-leaf">
        <LessonCard
          title={section.title}
          code={section.assetCode}
          variant="section-leaf"
          active={isLeafActive}
          onClick={() =>
            onSelectLesson({ systemId: system.id, sectionId: section.id, topicId: null })
          }
        />
      </li>
    );
  }

  if (!hasTopics) {
    return (
      <li className="nav-section-leaf">
        <button
          type="button"
          className={`section-trigger${isLeafActive ? " active" : ""}`}
          onClick={() =>
            onSelectLesson({ systemId: system.id, sectionId: section.id, topicId: null })
          }
        >
          {section.title}
        </button>
      </li>
    );
  }

  return (
    <li className={`nav-section-group${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="section-trigger"
        aria-expanded={open}
        onClick={() => onToggleSection(key)}
      >
        <span className="chevron chevron--sm" aria-hidden>
          {open ? "▼" : "▶"}
        </span>
        <span>{section.title}</span>
      </button>
      {open ? (
        <ul className="topic-list">
          {section.topics!.map((topic) => (
            <TopicItem
              key={topic.id}
              system={system}
              section={section}
              topic={topic}
              selection={selection}
              onSelectLesson={onSelectLesson}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CourseNav({
  openSystems,
  openSections,
  selection,
  onToggleSystem,
  onToggleSection,
  onSelectLesson,
}: Props) {
  return (
    <nav className="sidebar" aria-label={courseTitle}>
      {systems.map((system) => {
        const sysOpen = openSystems[system.id] ?? false;
        return (
          <div key={system.id} className={`accordion accordion--system${sysOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="accordion-trigger accordion-trigger--system"
              aria-expanded={sysOpen}
              onClick={() => onToggleSystem(system.id)}
            >
              <span className="chevron" aria-hidden>
                {sysOpen ? "▼" : "▶"}
              </span>
              <span className="system-name">{system.title}</span>
            </button>
            {sysOpen ? (
              <div className="section-tree">
                <ul className="section-list">
                  {system.sections.map((section) => (
                    <SectionBlock
                      key={section.id}
                      system={system}
                      section={section}
                      openSections={openSections}
                      selection={selection}
                      onToggleSection={onToggleSection}
                      onSelectLesson={onSelectLesson}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function useLessonFromSelection(selection: LessonSelection | null) {
  if (!selection) return null;
  return resolveLesson(selection.systemId, selection.sectionId, selection.topicId);
}
