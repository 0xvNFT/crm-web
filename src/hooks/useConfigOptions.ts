import { useConfig } from '@/api/endpoints/config'

export interface ConfigOption {
  value: string
  label: string
}

function toLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function useConfigOptions(key: string): ConfigOption[] {
  const { data } = useConfig()
  const values = data?.[key] ?? []
  // Prefer parallel label array (e.g. "user.role.label") when available.
  // Backend provides index-matched labels for keys where auto-generated labels are wrong.
  const labels = data?.[`${key}.label`]
  return values.map((v, i) => ({
    value: v,
    label: labels?.[i] ?? toLabel(v),
  }))
}
