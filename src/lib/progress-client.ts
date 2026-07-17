import { doc, getDoc, setDoc } from 'firebase/firestore'

export const AUTO_RESOURCES = ['V', 'P'] as const
export const MAX_PROGRESS_LEVEL = 3

export type AutoResource = (typeof AUTO_RESOURCES)[number]

export function progressDocId(
  userId: string,
  packageId: string,
  itemKey: string,
  resource: string,
): string {
  const safeKey = `${itemKey}/${resource}`.replace(/\//g, '__')
  return `${userId}_${packageId}_${safeKey}`
}

export function levelFromWatchCount(watchCount?: number | null): number {
  const n = typeof watchCount === 'number' ? watchCount : 0
  return Math.min(MAX_PROGRESS_LEVEL, Math.max(0, n))
}

export async function recordWatchComplete(
  db: import('firebase/firestore').Firestore,
  userId: string,
  packageId: string,
  itemKey: string,
  resource: AutoResource,
): Promise<number> {
  const id = progressDocId(userId, packageId, itemKey, resource)
  const ref = doc(db, 'progress', id)

  let current = 0
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      current = levelFromWatchCount(snap.data().watch_count)
    }
  } catch {
    current = 0
  }

  const next = Math.min(MAX_PROGRESS_LEVEL, current + 1) as 0 | 1 | 2 | 3

  await setDoc(
    ref,
    {
      user_id: userId,
      package_id: packageId,
      item_key: itemKey,
      resource,
      tracking: 'auto',
      watch_count: next,
      status: next > 0 ? 'completed' : 'started',
      updated_at: new Date().toISOString(),
    },
    { merge: true },
  )

  return next
}
