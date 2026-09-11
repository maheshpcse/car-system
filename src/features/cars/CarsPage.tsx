import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { readStorage, writeStorage } from '@/core/utils/storage'
import { CATEGORIES, SORT_OPTIONS, labelFor } from '@/data/categories'
import type { SortKey, VehicleCategory, VehicleFilters } from '@/models/vehicle'
import { Icon } from '@/shared/icons/Icon'
import { Button, ButtonLink, IconButton } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Select } from '@/shared/ui/Field'
import { Pagination } from '@/shared/ui/Pagination'
import { MenuItem, Popover } from '@/shared/ui/Popover'
import { Segmented } from '@/shared/ui/Segmented'
import { VehicleCard, VehicleCardSkeleton } from '@/shared/vehicle/VehicleCard'
import { FilterPanel } from './FilterPanel'
import { countActiveFilters, DEFAULT_FILTERS, useVehicleQuery } from './useVehicleQuery'
import styles from './CarsPage.module.scss'

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.id, label: c.label }))
const FILTER_STORAGE_KEY = 'carFilters'
const PAGE_SIZE = 6

export default function CarsPage() {
  useDocumentTitle('Explore Cars', 'Search, filter and sort the complete Aurora Motors line-up.')
  const [params, setParams] = useSearchParams()
  const { viewMode, setViewMode, addRecentSearch } = usePreferences()

  const [filters, setFilters] = useState<VehicleFilters>(() => {
    const stored = readStorage<Partial<VehicleFilters>>(FILTER_STORAGE_KEY, {})
    const category = (params.get('category') as VehicleCategory | null) ?? stored.category ?? 'all'
    const brand = params.get('brand')
    return {
      ...DEFAULT_FILTERS,
      ...stored,
      category: CATEGORIES.some((c) => c.id === category) ? category : 'all',
      query: params.get('q') ?? '',
      brands: brand ? [brand] : (stored.brands ?? []),
    }
  })
  const [draftQuery, setDraftQuery] = useState(filters.query)
  const [sort, setSort] = useState<SortKey>(() => (params.get('sort') as SortKey | null) ?? readStorage<SortKey>('carSort', 'recommended'))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const { results, loading, total } = useVehicleQuery(filters, sort)
  const activeCount = countActiveFilters(filters)

  const [page, setPage] = useState(() => Math.max(1, Number(params.get('page')) || 1))
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageResults = useMemo(
    () => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage],
  )
  const toolbarRef = useRef<HTMLDivElement>(null)

  const changePage = (next: number) => {
    setPage(next)
    const top = toolbarRef.current?.getBoundingClientRect().top ?? 0
    window.scrollTo({ top: window.scrollY + top - 140, behavior: 'smooth' })
  }

  // Keep URL and storage in sync with the current search state.
  useEffect(() => {
    const next = new URLSearchParams()
    if (filters.query) next.set('q', filters.query)
    if (filters.category !== 'all') next.set('category', filters.category)
    if (sort !== 'recommended') next.set('sort', sort)
    if (currentPage > 1) next.set('page', String(currentPage))
    setParams(next, { replace: true })
    const { query: _q, ...persisted } = filters
    writeStorage(FILTER_STORAGE_KEY, persisted)
    writeStorage('carSort', sort)
  }, [filters, sort, currentPage, setParams])

  // React to external navigation (e.g. from the global search) while mounted.
  useEffect(() => {
    const q = params.get('q') ?? ''
    const category = (params.get('category') as VehicleCategory | null) ?? 'all'
    const brand = params.get('brand')
    setFilters((f) => {
      if (f.query === q && f.category === category && (!brand || f.brands.includes(brand))) return f
      return { ...f, query: q, category, brands: brand ? [brand] : f.brands }
    })
    setDraftQuery(q)
  }, [params])

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    setPage(1)
    setFilters((f) => ({ ...f, query: draftQuery.trim() }))
    addRecentSearch(draftQuery)
  }

  const clearAll = useCallback(() => {
    setPage(1)
    setFilters(DEFAULT_FILTERS)
    setDraftQuery('')
  }, [])

  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = []
    if (filters.query) chips.push({ label: `“${filters.query}”`, onRemove: () => { setFilters((f) => ({ ...f, query: '' })); setDraftQuery('') } })
    filters.brands.forEach((b) => chips.push({ label: b, onRemove: () => setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== b) })) }))
    filters.bodyTypes.forEach((b) => chips.push({ label: b, onRemove: () => setFilters((f) => ({ ...f, bodyTypes: f.bodyTypes.filter((x) => x !== b) })) }))
    filters.fuelTypes.forEach((b) => chips.push({ label: b, onRemove: () => setFilters((f) => ({ ...f, fuelTypes: f.fuelTypes.filter((x) => x !== b) })) }))
    filters.transmissions.forEach((b) => chips.push({ label: b, onRemove: () => setFilters((f) => ({ ...f, transmissions: f.transmissions.filter((x) => x !== b) })) }))
    if (filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) chips.push({ label: `≤ $${Math.round(filters.priceRange[1] / 1000)}k`, onRemove: () => setFilters((f) => ({ ...f, priceRange: DEFAULT_FILTERS.priceRange })) })
    if (filters.minYear > DEFAULT_FILTERS.minYear) chips.push({ label: `${filters.minYear}+`, onRemove: () => setFilters((f) => ({ ...f, minYear: DEFAULT_FILTERS.minYear })) })
    if (filters.minRange > 0) chips.push({ label: `≥ ${filters.minRange} km`, onRemove: () => setFilters((f) => ({ ...f, minRange: 0 })) })
    if (filters.minPower > 0) chips.push({ label: `≥ ${filters.minPower} hp`, onRemove: () => setFilters((f) => ({ ...f, minPower: 0 })) })
    if (filters.minSeats > 0) chips.push({ label: `≥ ${filters.minSeats} seats`, onRemove: () => setFilters((f) => ({ ...f, minSeats: 0 })) })
    return chips
  }, [filters])

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        {/* Banner ---------------------------------------------------------- */}
        <header className={styles.banner}>
          <div className={styles.bannerText}>
            <span className="t-eyebrow">Discovery</span>
            <h1 className="t-title">Explore the line-up.</h1>
            <p className="t-description">
              {total} vehicles across {CATEGORIES.length - 1} categories. Search by name, powertrain or body type, then refine with filters.
            </p>
          </div>
          <div className={styles.bannerAside}>
            <ButtonLink to="/showroom" variant="ghost" iconLeft="showroom">
              View in showroom
            </ButtonLink>
          </div>
        </header>

        {/* Toolbar --------------------------------------------------------- */}
        <div ref={toolbarRef} className={styles.toolbar} role="search">
          <form className={styles.searchGroup} onSubmit={submitSearch}>
            <Select
              aria-label="Category"
              options={CATEGORY_OPTIONS}
              value={filters.category}
              onChange={(value) => {
                setPage(1)
                setFilters((f) => ({ ...f, category: value }))
              }}
              iconLeft="layers"
              wrapperClassName={styles.category}
            />
            <div className={styles.searchField}>
              <Icon name="search" size={17} className={styles.searchIcon} />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search vehicles…"
                aria-label="Search vehicles"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
              />
              {draftQuery && (
                <button type="button" className={styles.searchClear} aria-label="Clear search" onClick={() => { setDraftQuery(''); setFilters((f) => ({ ...f, query: '' })) }}>
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
            <Button type="submit" className={styles.searchButton}>
              Search
            </Button>
          </form>

          <div className={styles.viewGroup}>
            <Segmented
              label="Layout"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'grid', label: 'Grid', icon: 'grid', iconOnly: true },
                { value: 'list', label: 'List', icon: 'list', iconOnly: true },
              ]}
            />
            <Button variant="ghost" iconLeft="filter" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog" className={styles.filterButton}>
              Filters
              {activeCount > 0 && <span className={styles.filterCount}>{activeCount}</span>}
            </Button>
            <Popover
              open={sortOpen}
              onClose={() => setSortOpen(false)}
              width={220}
              anchor={
                <Button variant="ghost" iconLeft="sort" onClick={() => setSortOpen((v) => !v)} aria-haspopup="menu" aria-expanded={sortOpen} className={styles.sortButton}>
                  <span className={styles.sortLabel}>{labelFor(SORT_OPTIONS, sort)}</span>
                </Button>
              }
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.id} active={opt.id === sort} onClick={() => { setSort(opt.id); setPage(1); setSortOpen(false) }} trailing={opt.id === sort ? <Icon name="check" size={14} /> : undefined}>
                  {opt.label}
                </MenuItem>
              ))}
            </Popover>
          </div>
        </div>

        {/* Result meta ----------------------------------------------------- */}
        <div className={styles.meta}>
          <p className={styles.count} aria-live="polite">
            {loading ? 'Searching…' : `${results.length} of ${total} vehicles`}
            {filters.category !== 'all' && <span> · {labelFor(CATEGORIES, filters.category)}</span>}
          </p>
          {activeChips.length > 0 && (
            <div className={styles.chips}>
              {activeChips.map((chip) => (
                <button key={chip.label} type="button" className={styles.chip} onClick={chip.onRemove} aria-label={`Remove filter ${chip.label}`}>
                  {chip.label} <Icon name="x" size={12} />
                </button>
              ))}
              <button type="button" className={styles.clearAll} onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results --------------------------------------------------------- */}
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div key="loading" className={`${styles.results} ${styles[viewMode]}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} aria-busy="true">
              {Array.from({ length: viewMode === 'grid' ? 6 : 3 }, (_, i) => (
                <VehicleCardSkeleton key={i} mode={viewMode} />
              ))}
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div key={`results-${viewMode}-${currentPage}`} className={styles.resultsBlock} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className={`${styles.results} ${styles[viewMode]}`}>
                {pageResults.map((v, i) => (
                  <VehicleCard key={v.id} vehicle={v} mode={viewMode} index={i} />
                ))}
              </div>
              <Pagination page={currentPage} pageCount={pageCount} onChange={changePage} total={results.length} pageSize={PAGE_SIZE} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <EmptyState
                icon="search"
                title="No vehicles match"
                description="Try a broader search term, another category, or clear a few filters to see more of the line-up."
                action={
                  <>
                    <Button onClick={clearAll} iconLeft="refresh">
                      Clear search & filters
                    </Button>
                    <ButtonLink to="/showroom" variant="ghost">
                      Browse the showroom
                    </ButtonLink>
                  </>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FilterPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} onChange={(next) => { setPage(1); setFilters(next) }} resultCount={results.length} />
      <IconButton icon="filter" label="Open filters" size="lg" variant="primary" className={styles.fab} onClick={() => setFiltersOpen(true)} />
    </PageTransition>
  )
}
