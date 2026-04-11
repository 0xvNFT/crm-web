import { useState, useRef, useEffect, useId } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, X } from 'lucide-react'

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

export interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  /** Pre-populate the display label when options list is empty (e.g. edit mode before search) */
  selectedOption?: ComboboxOption
  placeholder?: string
  searchPlaceholder?: string
  onSearchChange?: (q: string) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
  error?: boolean
}

export function Combobox({
  value,
  onChange,
  options,
  selectedOption,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  onSearchChange,
  isLoading = false,
  disabled = false,
  className,
  error = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  // Fall back to selectedOption when the options list hasn't been populated yet (edit mode)
  const selected = options.find((o) => o.value === value) ?? (value ? selectedOption : undefined)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    if (disabled) return
    setOpen(true)
    setSearch('')
    onSearchChange?.('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(option: ComboboxOption) {
    onChange(option.value)
    setOpen(false)
    setSearch('')
    setActiveIndex(-1)
    onSearchChange?.('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
  }

  function handleSearchChange(q: string) {
    setSearch(q)
    onSearchChange?.(q)
    setActiveIndex(-1)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0 && options[activeIndex]) {
      e.preventDefault()
      handleSelect(options[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:ring-destructive',
          !error && 'border-input',
          open && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <X
              className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
              aria-hidden="true"
            />
          )}
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
              className="w-full rounded-sm border-0 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-52 overflow-y-auto p-1"
          >
            {isLoading ? (
              <li role="option" aria-selected={false} aria-disabled="true" className="px-2 py-3 text-center text-xs text-muted-foreground">
                Loading...
              </li>
            ) : options.length === 0 ? (
              <li role="option" aria-selected={false} aria-disabled="true" className="px-2 py-3 text-center text-xs text-muted-foreground">
                {search.length >= 2 ? 'No results found.' : 'Type to search...'}
              </li>
            ) : (
              options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(option)
                    }
                  }}
                  tabIndex={activeIndex === index ? 0 : -1}
                  className={cn(
                    'flex flex-col rounded-sm px-2 py-1.5 text-sm cursor-pointer',
                    'hover:bg-accent hover:text-accent-foreground',
                    option.value === value && 'bg-accent text-accent-foreground font-medium',
                    activeIndex === index && 'ring-1 ring-ring'
                  )}
                >
                  <span>{option.label}</span>
                  {option.sublabel && (
                    <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
