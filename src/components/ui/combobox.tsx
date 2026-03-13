import { useState, useRef, useEffect } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
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
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
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
            />
          )}
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
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
              placeholder={searchPlaceholder}
              className="w-full rounded-sm border-0 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto p-1">
            {isLoading ? (
              <li className="px-2 py-3 text-center text-xs text-muted-foreground">Loading...</li>
            ) : options.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-muted-foreground">
                {search.length >= 2 ? 'No results found.' : 'Type to search...'}
              </li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex flex-col rounded-sm px-2 py-1.5 text-sm cursor-pointer',
                    'hover:bg-accent hover:text-accent-foreground',
                    option.value === value && 'bg-accent text-accent-foreground font-medium'
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
