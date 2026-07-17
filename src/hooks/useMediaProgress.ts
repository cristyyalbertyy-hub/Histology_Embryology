import { useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { getFirestoreDb } from '../lib/firebase'
import { resolveProgressPackageId } from '../lib/packageAccess'
import { progressDocId, recordWatchComplete, type AutoResource } from '../lib/progress-client'

export function useMediaProgress(
  itemKey: string | undefined,
  chapterPrefix: string | undefined,
) {
  const { user, hasAccess, ownedPackageIds } = useAuth()

  const packageId = useMemo(() => {
    if (!chapterPrefix) return null
    return resolveProgressPackageId(ownedPackageIds, chapterPrefix)
  }, [chapterPrefix, ownedPackageIds])

  const trackWatchComplete = useCallback(
    async (resource: AutoResource) => {
      if (!user || !hasAccess || !itemKey || !packageId) return
      try {
        const level = await recordWatchComplete(
          getFirestoreDb(),
          user.uid,
          packageId,
          itemKey,
          resource,
        )
        console.info('Progress saved:', { packageId, itemKey, resource, level })
      } catch (err) {
        const id = progressDocId(user.uid, packageId, itemKey, resource)
        console.warn('Could not save watch progress:', { id, packageId, itemKey, resource, err })
      }
    },
    [user, hasAccess, itemKey, packageId],
  )

  return { trackWatchComplete }
}
