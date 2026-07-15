/** Mirrors Site Medical packages/catalog.json → packageAccess.histology-embryology */
export const PARENT_APP_ID = 'histology-embryology' as const

export const CHAPTERS_BY_PACKAGE_ID: Record<string, readonly string[]> = {
  histology: ['cy', 'hi'],
  embryology: ['em', 'or'],
  'histology-embryology': ['cy', 'hi', 'em', 'or'],
}

export const RELEVANT_PACKAGE_IDS = Object.keys(CHAPTERS_BY_PACKAGE_ID)

export const ALL_CHAPTER_PREFIXES = ['cy', 'hi', 'em', 'or'] as const

export const PACKAGE_LABELS: Record<string, string> = {
  histology: 'Histology',
  embryology: 'Embryology',
  'histology-embryology': 'Histology and Embryology (complete)',
}

export const PACKAGE_APP_TITLES: Record<string, string> = {
  histology: 'Histology',
  embryology: 'Embryology',
  'histology-embryology': 'Histology And Embryology',
}

export const PACKAGE_OVERVIEW_LEADS: Record<string, string> = {
  histology:
    'Cytology and histology — video, podcast, infographic and quiz for each sub-topic.',
  embryology:
    'Embryology and organogenesis — video, podcast, infographic and quiz for each sub-topic.',
  'histology-embryology':
    'Cytology, histology, embryology and organogenesis — four chapters with video, podcast, infographic and quiz for each sub-topic.',
}

export const PACKAGE_OVERVIEW_IMAGES: Record<string, string> = {
  histology: '/Histology.png',
  embryology: '/Embryology.png',
  'histology-embryology': '/InfographicA.png',
}

export function resolveAppTitle(
  ownedPackageIds: string[],
  launchPackageId?: string | null,
  fallback = PACKAGE_APP_TITLES[PARENT_APP_ID],
): string {
  const launch = launchPackageId?.trim()
  if (launch && PACKAGE_APP_TITLES[launch]) return PACKAGE_APP_TITLES[launch]

  if (ownedPackageIds.includes(PARENT_APP_ID)) {
    return PACKAGE_APP_TITLES[PARENT_APP_ID] ?? fallback
  }

  const partials = RELEVANT_PACKAGE_IDS.filter(
    (id) => id !== PARENT_APP_ID && ownedPackageIds.includes(id),
  )
  if (partials.length === 1) {
    return PACKAGE_APP_TITLES[partials[0]] ?? fallback
  }

  return fallback
}

export function resolveOverviewLead(
  ownedPackageIds: string[],
  launchPackageId?: string | null,
  fallback = PACKAGE_OVERVIEW_LEADS[PARENT_APP_ID],
): string {
  const launch = launchPackageId?.trim()
  if (launch && PACKAGE_OVERVIEW_LEADS[launch]) return PACKAGE_OVERVIEW_LEADS[launch]

  if (ownedPackageIds.includes(PARENT_APP_ID)) {
    return PACKAGE_OVERVIEW_LEADS[PARENT_APP_ID] ?? fallback
  }

  const partials = RELEVANT_PACKAGE_IDS.filter(
    (id) => id !== PARENT_APP_ID && ownedPackageIds.includes(id),
  )
  if (partials.length === 1) {
    return PACKAGE_OVERVIEW_LEADS[partials[0]] ?? fallback
  }

  return fallback
}

export function resolveOverviewImage(
  ownedPackageIds: string[],
  launchPackageId?: string | null,
  fallback = PACKAGE_OVERVIEW_IMAGES[PARENT_APP_ID],
): string {
  const launch = launchPackageId?.trim()
  if (launch && PACKAGE_OVERVIEW_IMAGES[launch]) return PACKAGE_OVERVIEW_IMAGES[launch]

  if (ownedPackageIds.includes(PARENT_APP_ID)) {
    return PACKAGE_OVERVIEW_IMAGES[PARENT_APP_ID] ?? fallback
  }

  const partials = RELEVANT_PACKAGE_IDS.filter(
    (id) => id !== PARENT_APP_ID && ownedPackageIds.includes(id),
  )
  if (partials.length === 1) {
    return PACKAGE_OVERVIEW_IMAGES[partials[0]] ?? fallback
  }

  return fallback
}

export function allowedPrefixesFromPackageIds(packageIds: Iterable<string>): Set<string> {
  const out = new Set<string>()
  for (const id of packageIds) {
    for (const prefix of CHAPTERS_BY_PACKAGE_ID[id] ?? []) {
      out.add(prefix)
    }
  }
  return out
}

export function packagesUnlockingChapter(prefix: string): string[] {
  return Object.entries(CHAPTERS_BY_PACKAGE_ID)
    .filter(([, prefixes]) => prefixes.includes(prefix) && prefixes.length < ALL_CHAPTER_PREFIXES.length)
    .map(([id]) => id)
}
