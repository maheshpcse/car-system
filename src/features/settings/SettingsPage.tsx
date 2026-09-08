import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Toggle } from '@/shared/ui/Field'
import { Segmented } from '@/shared/ui/Segmented'
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider'
import styles from './SettingsPage.module.scss'

const THEMES: { id: ThemePreference; label: string; icon: IconName; description: string }[] = [
  { id: 'light', label: 'Light', icon: 'sun', description: 'Warm ivory surfaces and deep indigo accents.' },
  { id: 'dark', label: 'Dark', icon: 'moon', description: 'Slate backgrounds with softened lighting in 3D scenes.' },
  { id: 'system', label: 'System', icon: 'monitor', description: 'Follow your operating system preference.' },
]

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const { preference, setPreference } = useTheme()
  const { sidebarCollapsed, setSidebarCollapsed, viewMode, setViewMode, reducedEffects, setReducedEffects, clearRecentSearches, clearCompare } = usePreferences()
  const { notify } = useToast()

  const resetLocalData = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('aurora.'))
      .forEach((k) => localStorage.removeItem(k))
    notify('Local data cleared. Reloading…', 'success')
    window.setTimeout(() => window.location.reload(), 600)
  }

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <span className="t-eyebrow">Preferences</span>
          <h1 className="t-title">Settings</h1>
          <p className="t-description">Appearance, layout and performance preferences are stored locally and applied instantly.</p>
        </header>

        <section className={styles.section} aria-labelledby="appearance">
          <h2 id="appearance" className="t-subheading">Appearance</h2>
          <div className={styles.themes} role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={preference === t.id} className={cx(styles.theme, preference === t.id && styles.themeActive)} onClick={() => setPreference(t.id)}>
                <span className={cx(styles.themePreview, styles[`preview-${t.id}`])} aria-hidden="true">
                  <span />
                  <span />
                </span>
                <span className={styles.themeText}>
                  <strong>
                    <Icon name={t.icon} size={15} /> {t.label}
                  </strong>
                  <span>{t.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="layout">
          <h2 id="layout" className="t-subheading">Layout</h2>
          <Card padding="md" className={styles.rows}>
            <Toggle label="Collapse sidebar" description="Show icons only in the desktop navigation." checked={sidebarCollapsed} onChange={(e) => setSidebarCollapsed(e.target.checked)} />
            <div className={styles.row}>
              <div>
                <span className={styles.rowLabel}>Default results layout</span>
                <span className={styles.rowDescription}>Used on Explore Cars and Favourites.</span>
              </div>
              <Segmented
                label="Default layout"
                size="sm"
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'grid', label: 'Grid', icon: 'grid' },
                  { value: 'list', label: 'List', icon: 'list' },
                ]}
              />
            </div>
          </Card>
        </section>

        <section className={styles.section} aria-labelledby="performance">
          <h2 id="performance" className="t-subheading">Performance & motion</h2>
          <Card padding="md" className={styles.rows}>
            <Toggle
              label="Reduce visual effects"
              description="Disables the custom cursor, floor reflections and high-DPI rendering in 3D scenes."
              checked={reducedEffects}
              onChange={(e) => setReducedEffects(e.target.checked)}
            />
            <p className={styles.note}>
              <Icon name="info" size={13} /> The app also respects your operating system’s “reduce motion” setting automatically.
            </p>
          </Card>
        </section>

        <section className={styles.section} aria-labelledby="data">
          <h2 id="data" className="t-subheading">Data</h2>
          <Card padding="md" className={styles.rows}>
            <div className={styles.row}>
              <div>
                <span className={styles.rowLabel}>Recent searches</span>
                <span className={styles.rowDescription}>Suggestions shown in the search box.</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { clearRecentSearches(); notify('Recent searches cleared') }}>
                Clear
              </Button>
            </div>
            <div className={styles.row}>
              <div>
                <span className={styles.rowLabel}>Comparison list</span>
                <span className={styles.rowDescription}>Vehicles currently queued for comparison.</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { clearCompare(); notify('Comparison cleared') }}>
                Clear
              </Button>
            </div>
            <div className={styles.row}>
              <div>
                <span className={styles.rowLabel}>Reset local data</span>
                <span className={styles.rowDescription}>Removes theme, favourites, builds and the demo session from this browser.</span>
              </div>
              <Button variant="danger" size="sm" iconLeft="trash" onClick={resetLocalData}>
                Reset
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </PageTransition>
  )
}
