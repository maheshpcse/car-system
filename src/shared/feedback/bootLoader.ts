declare global {
  interface Window {
    __bootStart?: number
  }
}

const MIN_VISIBLE_MS = 700

/** Fades out the HTML boot loader once the first route has painted. */
export function dismissBootLoader() {
  const el = document.getElementById('boot-loader')
  if (!el || el.classList.contains('is-done')) return
  const elapsed = Date.now() - (window.__bootStart ?? Date.now())
  window.setTimeout(() => {
    el.classList.add('is-done')
    el.addEventListener('transitionend', () => el.remove(), { once: true })
    window.setTimeout(() => el.remove(), 800)
  }, Math.max(0, MIN_VISIBLE_MS - elapsed))
}
