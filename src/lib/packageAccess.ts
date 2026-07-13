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
