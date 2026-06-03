export type MediaTabId = "video" | "podcast" | "infographic" | "questions";

const TABS: { id: MediaTabId; label: string }[] = [
  { id: "video", label: "Video" },
  { id: "podcast", label: "Podcast" },
  { id: "infographic", label: "Infographic" },
  { id: "questions", label: "Questionnaire" },
];

type Props = {
  active: MediaTabId;
  onChange: (tab: MediaTabId) => void;
};

export function MediaTabs({ active, onChange }: Props) {
  return (
    <div className="media-tabs" role="tablist" aria-label="Lesson media">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`panel-${tab.id}`}
          className={`media-tab${active === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
