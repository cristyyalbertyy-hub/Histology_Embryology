/** Fire once per play-through when media reaches the end (or last ~0.75s). */
export function bindPlaybackProgress(
  element: HTMLMediaElement,
  onComplete: () => void,
): () => void {
  let tracked = false

  const reset = () => {
    tracked = false
  }

  const completeOnce = () => {
    if (tracked) return
    tracked = true
    onComplete()
  }

  const maybeNearEnd = () => {
    if (tracked) return
    const duration = element.duration
    if (!Number.isFinite(duration) || duration <= 0) return
    if (element.currentTime >= Math.max(0, duration - 0.75)) {
      completeOnce()
    }
  }

  element.addEventListener('play', reset)
  element.addEventListener('seeking', reset)
  element.addEventListener('ended', completeOnce)
  element.addEventListener('timeupdate', maybeNearEnd)

  return () => {
    element.removeEventListener('play', reset)
    element.removeEventListener('seeking', reset)
    element.removeEventListener('ended', completeOnce)
    element.removeEventListener('timeupdate', maybeNearEnd)
  }
}
