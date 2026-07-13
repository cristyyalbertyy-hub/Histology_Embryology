import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { getFirestoreDb } from './firebase'
import { RELEVANT_PACKAGE_IDS } from './packageAccess'

export type Entitlement = {
  package_id: string
  expires_at: string
}

function parseActiveEntitlement(data: {
  package_id: string
  expires_at: string
}): Entitlement | null {
  const expiresAt = new Date(data.expires_at)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    return null
  }
  return {
    package_id: data.package_id,
    expires_at: data.expires_at,
  }
}

export async function fetchActiveEntitlements(
  userId: string,
  packageIds: readonly string[] = RELEVANT_PACKAGE_IDS,
): Promise<Entitlement[]> {
  const allowed = new Set(packageIds)
  const found = new Map<string, Entitlement>()
  const db = getFirestoreDb()

  const q = query(collection(db, 'entitlements'), where('user_id', '==', userId))
  const snapshot = await getDocs(q)
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as { package_id: string; expires_at: string }
    if (!allowed.has(data.package_id)) continue
    const active = parseActiveEntitlement(data)
    if (active) found.set(active.package_id, active)
  }

  await Promise.all(
    packageIds.map(async (packageId) => {
      if (found.has(packageId)) return
      const directSnap = await getDoc(doc(db, 'entitlements', `${userId}_${packageId}`))
      if (!directSnap.exists()) return
      const active = parseActiveEntitlement(
        directSnap.data() as { package_id: string; expires_at: string },
      )
      if (active) found.set(packageId, active)
    }),
  )

  return [...found.values()]
}

/** @deprecated Use fetchActiveEntitlements — kept for single-package callers */
export async function fetchActiveEntitlement(
  userId: string,
  packageId: string,
): Promise<Entitlement | null> {
  const results = await fetchActiveEntitlements(userId, [packageId])
  return results[0] ?? null
}
