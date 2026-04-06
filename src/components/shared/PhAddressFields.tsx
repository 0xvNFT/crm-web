import { useMemo } from 'react'
import { type Control, type FieldErrors, type UseFormSetValue, Controller, useWatch } from 'react-hook-form'
import {
  getAllRegions,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from '@aivangogh/ph-address'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormRow } from '@/components/shared/FormRow'

// ─── Types ───────────────────────────────────────────────────────────────────

// Why `any` on Control/SetValue/FieldErrors:
// This component is intentionally schema-agnostic — it must work with ContactFormData,
// AccountFormData, or any future form that includes PH address fields.
// Field names are derived dynamically from `prefix` (e.g. `${prefix}Region`), so TypeScript
// cannot statically verify them against a specific schema at compile time regardless.
// A generic <T extends FieldValues> would give false confidence without real type safety —
// it still couldn't verify that T actually contains the prefix-derived keys.
// `Control<any>` is the standard RHF pattern for reusable sub-field components with dynamic names.
interface PhAddressFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>
  /** Field name prefix — binds to {prefix}Region, {prefix}Province, {prefix}City, {prefix}Barangay */
  prefix?: string
  disabled?: boolean
}

// ─── Static data — loaded once at module level, not on every render ──────────

const REGIONS = getAllRegions().map((r) => ({ value: r.name, psgcCode: r.psgcCode, label: r.name }))

// ─── Component ───────────────────────────────────────────────────────────────

export function PhAddressFields({ control, setValue, errors, prefix = 'address', disabled }: PhAddressFieldsProps) {
  const regionField   = `${prefix}Region`
  const provinceField = `${prefix}Province`
  const cityField     = `${prefix}City`
  const barangayField = `${prefix}Barangay`

  // Watch stored names (names are persisted, not PSGC codes)
  const selectedRegionName   = useWatch({ control, name: regionField })
  const selectedProvinceName = useWatch({ control, name: provinceField })
  const selectedCityName     = useWatch({ control, name: cityField })

  // Derive options purely from watched values — no useEffect/useState needed
  const selectedRegion = useMemo(
    () => REGIONS.find((r) => r.value === selectedRegionName),
    [selectedRegionName]
  )

  const provinces = useMemo(() => {
    if (!selectedRegion) return []
    return getProvincesByRegion(selectedRegion.psgcCode)
      .map((p) => ({ value: p.name, psgcCode: p.psgcCode, label: p.name }))
  }, [selectedRegion])

  // NCR and similar regions have no provinces — cities load directly from the region code
  const isProvinceless = !!selectedRegion && provinces.length === 0

  const cities = useMemo(() => {
    if (!selectedRegion) return []
    if (isProvinceless) {
      return getMunicipalitiesByProvince(selectedRegion.psgcCode)
        .map((c) => ({ value: c.name, psgcCode: c.psgcCode, label: c.name }))
    }
    const province = provinces.find((p) => p.value === selectedProvinceName)
    if (!province) return []
    return getMunicipalitiesByProvince(province.psgcCode)
      .map((c) => ({ value: c.name, psgcCode: c.psgcCode, label: c.name }))
  }, [selectedRegion, isProvinceless, provinces, selectedProvinceName])

  const barangays = useMemo(() => {
    const city = cities.find((c) => c.value === selectedCityName)
    if (!city) return []
    return getBarangaysByMunicipality(city.psgcCode)
      .map((b) => ({ value: b.name, label: b.name }))
  }, [cities, selectedCityName])

  return (
    <>
      <FormRow label="Region" error={errors?.[regionField]?.message as string | undefined /* Why: FieldErrors<any> index returns unknown */}>
        <Controller
          name={regionField}
          control={control}
          render={({ field }) => (
            <Select
              disabled={disabled}
              value={field.value ?? undefined}
              onValueChange={(val) => {
                field.onChange(val)
                // Clear downstream fields so stale selections don't persist
                setValue(provinceField, '')
                setValue(cityField,     '')
                setValue(barangayField, '')
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => <SelectItem key={r.psgcCode} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </FormRow>

      {/* Province — hidden for province-less regions (NCR). Field value stays '' so it doesn't submit garbage. */}
      {!isProvinceless && (
        <FormRow label="Province" error={errors?.[provinceField]?.message as string | undefined /* Why: FieldErrors<any> index returns unknown */}>
          <Controller
            name={provinceField}
            control={control}
            render={({ field }) => (
              <Select
                disabled={disabled || provinces.length === 0}
                value={field.value ?? undefined}
                onValueChange={(val) => {
                  field.onChange(val)
                  setValue(cityField,     '')
                  setValue(barangayField, '')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={provinces.length === 0 ? 'Select region first' : 'Select province'} />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => <SelectItem key={p.psgcCode} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </FormRow>
      )}

      <FormRow label="City / Municipality" error={errors?.[cityField]?.message as string | undefined /* Why: FieldErrors<any> index returns unknown */}>
        <Controller
          name={cityField}
          control={control}
          render={({ field }) => (
            <Select
              disabled={disabled || cities.length === 0}
              value={field.value ?? undefined}
              onValueChange={(val) => {
                field.onChange(val)
                setValue(barangayField, '')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={cities.length === 0 ? (selectedRegion && !isProvinceless ? 'Select province first' : 'Select region first') : 'Select city / municipality'} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c.psgcCode} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </FormRow>

      <FormRow label="Barangay" error={errors?.[barangayField]?.message as string | undefined /* Why: FieldErrors<any> index returns unknown */}>
        <Controller
          name={barangayField}
          control={control}
          render={({ field }) => (
            <Select
              disabled={disabled || barangays.length === 0}
              value={field.value ?? undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={barangays.length === 0 ? 'Select city first' : 'Select barangay'} />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </FormRow>
    </>
  )
}
