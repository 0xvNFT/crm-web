// REFERENCE PATTERN — Interns: copy the view mode structure only (DetailSection, DetailField, header, quick-contact strip).
// Ignore everything related to editing (ContactEditForm, editing state).
// Your task is read-only — list + detail view. No create or edit required.
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Award, Shield, Pencil, Trash2, UserPlus } from 'lucide-react'
import { useContact, useDeleteContact } from '@/api/endpoints/contacts'
import { useRole } from '@/hooks/useRole'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'
import { Button } from '@/components/ui/button'
import { formatDate, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { ContactEditForm } from './components/ContactEditForm'
import { ContactVisitsSection } from './components/ContactVisitsSection'
import { ContactActivitiesSection } from './components/ContactActivitiesSection'
import { ContactOpportunitiesSection } from './components/ContactOpportunitiesSection'
import { ContactAffiliationsSection } from './components/ContactAffiliationsSection'

// ─── Sub-components ────────────────────────────────────────────────────────────
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)

  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const { data: contact, isLoading, isError } = useContact(id ?? '')
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact()
  const { isManager, isReadOnly } = useRole()

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !contact) return <ErrorMessage message="Contact not found." />

  const fullName = [contact.salutation, contact.firstName, contact.middleName, contact.lastName]
    .filter(Boolean)
    .join(' ')

  const fullAddress = [
    contact.addressStreet,
    contact.addressBarangay,
    contact.addressCity,
    contact.addressProvince,
    contact.addressPostalCode,
    contact.addressCountry,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{fullName}</h1>
            <StatusBadge status={contact.status ?? 'active'} />
            {contact.prescribingAuthority && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <Award className="h-3 w-3" />
                Prescriber
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {contact.title && <span>{contact.title}</span>}
            {contact.contactType && (
              <>
                <span>·</span>
                <span>{formatLabel(contact.contactType)}</span>
              </>
            )}
            {contact.specialty && (
              <>
                <span>·</span>
                <span>{contact.specialty}</span>
              </>
            )}
            {contact.accountName && (
              <>
                <span>·</span>
                <span>{contact.accountName}</span>
              </>
            )}
          </div>
        </div>

        {!editing && !isReadOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/leads/new', {
                state: {
                  contactId: contact.id,
                  firstName:   contact.firstName  ?? undefined,
                  lastName:    contact.lastName   ?? undefined,
                  email:       contact.email      ?? undefined,
                  phone:       contact.phone ?? contact.mobile ?? undefined,
                  companyName: contact.accountName ?? undefined,
                  ...(contact.accountId ? { accountId: contact.accountId } : {}),
                },
              })}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Create Lead
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            {isManager && (
              <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quick contact strip */}
      <div className="flex flex-wrap gap-3">
        {contact.mobile && (
          <a
            href={`tel:${contact.mobile}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {contact.mobile}
          </a>
        )}
        {contact.phone && contact.phone !== contact.mobile && (
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {contact.phone}
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {contact.email}
          </a>
        )}
        {fullAddress && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            {fullAddress}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() =>
          deleteContact(id ?? '', {
            onSuccess: () => {
              toast('Contact deleted', { variant: 'success' })
              navigate('/contacts')
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Delete Contact?"
        description={`This will permanently delete "${fullName}" and all associated data. This cannot be undone.`}
        isPending={isDeleting}
      />

      {/* Edit mode */}
      {editing && (
        <ContactEditForm
          contactId={id ?? ''}
          contact={contact}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* View mode */}
      {!editing && (
        <div className="space-y-4">
          <DetailSection title="Professional Info">
            <DetailField label="Contact Type" value={formatLabel(contact.contactType)} />
            <DetailField label="Specialty" value={contact.specialty} />
            <DetailField label="Customer Class" value={contact.customerClass} />
            <DetailField label="Adoption Stage" value={formatLabel(contact.adoptionStage)} />
            <DetailField label="Years of Experience" value={contact.yearsOfExperience} />
            <DetailField label="Monthly Patient Volume" value={contact.patientVolumeMonthly} />
            <DetailField label="Professional Society" value={contact.professionalSociety} />
            <DetailField label="Lead Source" value={formatLabel(contact.leadSource)} />
          </DetailSection>

          <DetailSection title="Licensing & Credentials">
            <DetailField label="PRC Number" value={contact.prcNumber} />
            <DetailField label="PRC Expiry" value={formatDate(contact.prcExpiryDate)} />
            <DetailField label="NPI Number" value={contact.npiNumber} />
            <DetailField label="DEA Number" value={contact.deaNumber} />
            <DetailField label="State License" value={contact.stateLicenseNumber} />
            <DetailField label="Prescribing Authority" value={contact.prescribingAuthority} />
          </DetailSection>

          <DetailSection title="Contact Preferences">
            <DetailField label="Preferred Contact Method" value={formatLabel(contact.preferredContactMethod)} />
            <DetailField label="Preferred Contact Time" value={contact.preferredContactTime} />
            <DetailField label="Do Not Call" value={contact.doNotCall} />
            <DetailField label="Email Opt-Out" value={contact.emailOptOut} />
          </DetailSection>

          <DetailSection title="Consent & Compliance">
            <DetailField label="Consent Status" value={formatLabel(contact.consentConfirmedStatus)} />
            <DetailField label="Consent Date" value={formatDate(contact.consentConfirmedDate)} />
          </DetailSection>

          {contact.notes && (
            <div className="rounded-xl border bg-background p-5 space-y-2">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                Notes
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          <div className="rounded-xl border bg-background p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailField label="Contact Code" value={contact.contactCode} />
              <DetailField label="Created" value={formatDate(contact.createdAt)} />
              <DetailField label="Last Updated" value={formatDate(contact.updatedAt)} />
            </div>
          </div>

          <ContactAffiliationsSection contactId={id ?? ''} />
          <ContactOpportunitiesSection contactId={id ?? ''} />
          <ContactVisitsSection contactId={id ?? ''} />
          <ContactActivitiesSection contactId={id ?? ''} />
          <EntityTagsSection entityType="PharmaContact" entityId={id ?? ''} />
          <EntityNotesSection entityType="PharmaContact" entityId={id ?? ''} />
          <EntityHistorySection entityType="PharmaContact" entityId={id ?? ''} />
        </div>
      )}
    </div>
  )
}
