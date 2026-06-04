/** Leaf lesson — `assetCode` is the curriculum label; files use `mediaAssetStem()`. */
export type Topic = {
  id: string;
  title: string;
  assetCode: string;
  questionnairePath?: string;
};

/** Section with nested topics, or a single leaf when `topics` is omitted. */
export type Section = {
  id: string;
  title: string;
  topics?: Topic[];
  assetCode?: string;
  questionnairePath?: string;
};

export type System = {
  id: string;
  title: string;
  sections: Section[];
  /** Chapter overview infographic in `public/` (shown when exploring the chapter). */
  overviewImage?: string;
};

export const courseTitle = "Histology And Embryology";

export const systems: System[] = [
  {
    id: "cy",
    title: "Elements of Cytology",
    overviewImage: "/inf_cystology.png",
    sections: [
      {
        id: "cy-topics",
        title: "Cytology",
        topics: [
          { id: "cy-eco", title: "Eukaryotic cell organization", assetCode: "EC_ECO" },
          { id: "cy-om", title: "Organelles and membranes", assetCode: "EC_OM" },
          { id: "cy-nc", title: "Nucleus and chromatin", assetCode: "EC_NC" },
          { id: "cy-cd", title: "Cell cycle and death", assetCode: "EC_CCD" },
        ],
      },
    ],
  },
  {
    id: "hi",
    title: "Histology",
    sections: [
      {
        id: "hi-topics",
        title: "Tissues",
        topics: [
          { id: "hi-eg", title: "Epithelia and Glands", assetCode: "HE_HI_EG" },
          { id: "hi-ct", title: "Connective Tissues and ECM", assetCode: "HE_HI_CT" },
          { id: "hi-cb", title: "Cartilage and Bone", assetCode: "HE_HI_CB" },
          { id: "hi-bh", title: "Blood and Hemopoiesis", assetCode: "HE_HI_BH" },
          { id: "hi-il", title: "Immune and Lymphatic organs", assetCode: "HE_HI_IL" },
          { id: "hi-mt", title: "Muscle Tissues", assetCode: "HE_HI_MT" },
          { id: "hi-nt", title: "Nervous Tissue", assetCode: "HE_HI_NT" },
        ],
      },
    ],
  },
  {
    id: "em",
    title: "Embryology",
    sections: [
      {
        id: "em-gam",
        title: "Gametogenesis",
        topics: [
          { id: "em-sp", title: "Spermatogenesis", assetCode: "G_S" },
          { id: "em-og", title: "Oogenesis", assetCode: "G_O" },
          { id: "em-hc", title: "Hormonal control", assetCode: "G_HC" },
        ],
      },
      {
        id: "em-ed",
        title: "Early Development",
        topics: [
          { id: "em-fe", title: "Fertilization", assetCode: "ED_EF" },
          { id: "em-w14", title: "Weeks 1–4", assetCode: "ED_FW" },
          { id: "em-pl", title: "Primitive layers", assetCode: "ED_PL" },
          { id: "em-ef", title: "Embryonic folding", assetCode: "ED_EF" },
        ],
      },
      {
        id: "em-sr",
        title: "Stem Cells and Regeneration",
        assetCode: "E_STR",
      },
      {
        id: "em-pm",
        title: "Placenta and Membranes",
        assetCode: "E_PM",
      },
    ],
  },
  {
    id: "or",
    title: "Organogenesis",
    sections: [
      {
        id: "or-topics",
        title: "Systems",
        topics: [
          { id: "or-in", title: "Integumentary system", assetCode: "HE_OR_IN" },
          { id: "or-hn", title: "Head, neck, and oropharyngeal", assetCode: "HE_OR_HN" },
          { id: "or-gr", title: "Gut and Respiratory", assetCode: "HE_OR_GR" },
          { id: "or-ug", title: "Urogenital", assetCode: "HE_OR_UG" },
          { id: "or-sm", title: "Skeleton and Muscle", assetCode: "HE_OR_SM" },
          { id: "or-nc", title: "Nervous and Cardiovascular", assetCode: "HE_OR_NC" },
        ],
      },
    ],
  },
];

export type ResolvedLesson = {
  system: System;
  section: Section;
  topic: Topic | null;
  assetCode: string;
  questionnairePath?: string;
};

export function sectionHasTopics(section: Section): boolean {
  return (section.topics?.length ?? 0) > 0;
}

export function resolveLesson(
  systemId: string,
  sectionId: string,
  topicId: string | null,
): ResolvedLesson | null {
  const system = systems.find((s) => s.id === systemId);
  if (!system) return null;
  const section = system.sections.find((sec) => sec.id === sectionId);
  if (!section) return null;

  if (sectionHasTopics(section)) {
    if (!topicId) return null;
    const topic = section.topics!.find((t) => t.id === topicId);
    if (!topic) return null;
    return {
      system,
      section,
      topic,
      assetCode: topic.assetCode,
      questionnairePath: topic.questionnairePath ?? section.questionnairePath,
    };
  }

  if (topicId !== null) return null;
  if (!section.assetCode) return null;
  return {
    system,
    section,
    topic: null,
    assetCode: section.assetCode,
    questionnairePath: section.questionnairePath,
  };
}

export function mediaAssetStem(assetCode: string): string {
  return assetCode;
}

export function systemById(systemId: string): System | undefined {
  return systems.find((s) => s.id === systemId);
}
