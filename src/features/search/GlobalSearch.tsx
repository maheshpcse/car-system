import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { suggest, type Suggestion } from './searchService'
import styles from './GlobalSearch.module.scss'

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  autoFocus?: boolean
  size?: 'md' | 'lg'
  onNavigate?: () => void
}

const KIND_ICON: Record<Suggestion['kind'], IconName> = {
  vehicle: 'car',
  category: 'layers',
  brand: 'sparkle',
  query: 'search',
}

export function GlobalSearch({ className, placeholder = 'Search vehicles, brands, categories…', autoFocus, size = 'md', onNavigate }: GlobalSearchProps) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { recentSearches, addRecentSearch, clearRecentSearches } = usePreferences()
  const reduced = useReducedMotion()
  const listId = useId()

  const items = useMemo<Suggestion[]>(() => {
    if (value.trim()) return suggest(value)
    return recentSearches.map((term) => ({ kind: 'query', id: term, label: term, detail: 'Recent' }))
  }, [value, recentSearches])

  useEffect(() => setActiveIndex(-1), [items])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  // Global shortcut: "/" focuses search when not typing elsewhere.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && !target.isContentEditable) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = useCallback(
    (item: Suggestion | null) => {
      const term = value.trim()
      setOpen(false)
      onNavigate?.()
      if (item?.kind === 'vehicle') {
        addRecentSearch(item.label)
        navigate(`/cars/${item.id}`)
      } else if (item?.kind === 'category') {
        addRecentSearch(item.label)
        navigate(`/cars?category=${item.id}`)
      } else if (item?.kind === 'brand') {
        addRecentSearch(item.label)
        navigate(`/cars?brand=${encodeURIComponent(item.id)}`)
      } else if (item?.kind === 'query') {
        setValue(item.label)
        addRecentSearch(item.label)
        navigate(`/cars?q=${encodeURIComponent(item.label)}`)
      } else if (term) {
        addRecentSearch(term)
        navigate(`/cars?q=${encodeURIComponent(term)}`)
      }
      inputRef.current?.blur()
    },
    [value, navigate, addRecentSearch, onNavigate],
  )

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (i + 1) % Math.max(items.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(activeIndex >= 0 ? items[activeIndex] : null)
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showPanel = open && (items.length > 0 || value.trim().length > 0)

  return (
    <div ref={rootRef} className={cx(styles.root, styles[size], open && styles.focused, className)}>
      <div className={styles.control}>
        <Icon name="search" size={17} className={styles.icon} />
        <input
          ref={inputRef}
          type="search"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          aria-label="Search vehicles"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
        {value ? (
          <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => { setValue(''); inputRef.current?.focus() }}>
            <Icon name="x" size={14} />
          </button>
        ) : (
          <kbd className={styles.kbd} aria-hidden="true">
            /
          </kbd>
        )}
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: reduced ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -4 }}
            transition={{ duration: 0.16 }}
          >
            {items.length > 0 ? (
              <>
                {!value.trim() && (
                  <div className={styles.panelHeader}>
                    <span>Recent searches</span>
                    <button type="button" onClick={clearRecentSearches}>
                      Clear
                    </button>
                  </div>
                )}
                <ul id={listId} role="listbox" className={styles.list}>
                  {items.map((item, i) => (
                    <li
                      key={`${item.kind}-${item.id}`}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      className={cx(styles.item, i === activeIndex && styles.itemActive)}
                      onPointerEnter={() => setActiveIndex(i)}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => go(item)}
                    >
                      <span className={styles.itemIcon}>
                        <Icon name={KIND_ICON[item.kind]} size={15} />
                      </span>
                      <span className={styles.itemLabel}>{item.label}</span>
                      <span className={styles.itemDetail}>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className={styles.empty}>
                No matches for “{value}”. Press Enter to search anyway.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
