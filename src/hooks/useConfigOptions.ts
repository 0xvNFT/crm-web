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
  return values.map((v) => ({ value: v, label: toLabel(v) }))
}
