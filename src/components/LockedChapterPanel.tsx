import { STORE_URL } from '../lib/firebase'
import { PACKAGE_LABELS, packagesUnlockingChapter } from '../lib/packageAccess'

type LockedChapterPanelProps = {
  chapterId: string
  chapterTitle: string
}

export function LockedChapterPanel({ chapterId, chapterTitle }: LockedChapterPanelProps) {
  const unlockIds = packagesUnlockingChapter(chapterId)
  const bundleId = unlockIds.length > 1 ? 'histology-embryology' : null

  return (
    <div className="locked-chapter-panel">
      <p className="locked-chapter-panel__eyebrow">Conteúdo bloqueado</p>
      <h2 className="locked-chapter-panel__title">{chapterTitle}</h2>
      <p className="locked-chapter-panel__hint">
        O teu plano actual não inclui este capítulo. Compra um dos módulos abaixo para desbloquear.
      </p>
      <ul className="locked-chapter-panel__options">
        {unlockIds.map((id) => (
          <li key={id}>
            <strong>{PACKAGE_LABELS[id] ?? id}</strong>
          </li>
        ))}
        {bundleId ? (
          <li>
            <strong>{PACKAGE_LABELS[bundleId]}</strong>
            <span className="locked-chapter-panel__note"> — inclui Histology e Embryology</span>
          </li>
        ) : null}
      </ul>
      <div className="locked-chapter-panel__actions">
        <a className="btn btn-primary" href={STORE_URL}>
          Ver preços e comprar
        </a>
      </div>
    </div>
  )
}
