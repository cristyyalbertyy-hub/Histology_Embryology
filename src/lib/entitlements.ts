import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { getFirestoreDb, PACKAGE_ID } from './firebase'

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

export async function fetchActiveEntitlement(
  userId: string,
  packageId = PACKAGE_ID,
): Promise<Entitlement | null> {
  const db = getFirestoreDb()
  const directSnap = await getDoc(doc(db, 'entitlements', `${userId}_${packageId}`))
  if (directSnap.exists()) {
    const active = parseActiveEntitlement(
      directSnap.data() as { package_id: string; expires_at: string },
    )
    if (active) return active
  }

  const q = query(
    collection(db, 'entitlements'),
    where('user_id', '==', userId),
    where('package_id', '==', packageId),
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  return parseActiveEntitlement(
    snapshot.docs[0].data() as { package_id: string; expires_at: string },
  )
}
