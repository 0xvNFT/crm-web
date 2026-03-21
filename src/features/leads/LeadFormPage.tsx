import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateLead, useUpdateLead } from '@/api/endpoints/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { leadSchema, type LeadFormData } from '@/schemas/leads'
import { useConfigOptions } from '@/hooks/useConfigOptions'

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-xl border bg-background p-5 space-y-4">
			<h2 className="text-sm font-semibold text-foreground">{title}</h2>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
		</div>
	)
}

function FormRow({ label, required, error, children }: {
	label: string
	required?: boolean
	error?: string
	children: React.ReactNode
}) {
	return (
		<div className="space-y-1">
			<Label className="text-xs font-medium text-muted-foreground">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</Label>
			{children}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	)
}

export default function LeadFormPage() {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const isEdit = !!id
	const { mutate: createLead, isPending: isCreating } = useCreateLead()
	const { mutate: updateLead, isPending: isUpdating } = useUpdateLead(id ?? '')
	const isPending = isCreating || isUpdating
	const leadStatusOptions = useConfigOptions('lead.status')
	const ratingOptions = useConfigOptions('lead.rating')

	const { register, handleSubmit, control, formState: { errors } } = useForm<LeadFormData>({
		resolver: zodResolver(leadSchema) as Resolver<LeadFormData>,
	})

	function onSubmit(data: LeadFormData) {
		if (isEdit) {
			updateLead(data, {
				onSuccess: (lead) => {
					toast('Lead updated', { variant: 'success' })
					navigate(`/leads/${lead.id}`)
				},
				onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
			})
		} else {
			createLead(data, {
				onSuccess: (lead) => {
					toast('Lead created', { variant: 'success' })
					navigate(`/leads/${lead.id}`)
				},
				onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
			})
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<PageHeader
					title={isEdit ? 'Edit Lead' : 'New Lead'}
					description={isEdit ? 'Update lead information' : 'Add a new lead'}
				/>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<FormSection title="Lead Info">
					<FormRow label="Last Name" required error={errors.lastName?.message}>
						<Input {...register('lastName')} autoFocus />
					</FormRow>
					<FormRow label="First Name" error={errors.firstName?.message}>
						<Input {...register('firstName')} />
					</FormRow>
					<FormRow label="Company Name" error={errors.companyName?.message}>
						<Input {...register('companyName')} />
					</FormRow>
					<FormRow label="Lead Status" error={errors.leadStatus?.message}>
						<Controller
							name="leadStatus"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
									<SelectContent>
										{leadStatusOptions.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</FormRow>
					<FormRow label="Rating" error={errors.rating?.message}>
						<Controller
							name="rating"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
									<SelectContent>
										{ratingOptions.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</FormRow>
				</FormSection>

				<FormSection title="Contact Info">
					<FormRow label="Email" error={errors.email?.message}>
						<Input {...register('email')} type="email" />
					</FormRow>
					<FormRow label="Phone" error={errors.phone?.message}>
						<Input {...register('phone')} />
					</FormRow>
				</FormSection>

				<FormSection title="Additional Info">
					<FormRow label="Lead Source" error={errors.leadSource?.message}>
						<Input {...register('leadSource')} />
					</FormRow>
					<FormRow label="Lead Score" error={errors.leadScore?.message}>
						<Input {...register('leadScore')} type="number" min={0} />
					</FormRow>
				</FormSection>

				{/* Sticky footer — always visible regardless of form length */}
				<div className="sticky bottom-0 -mx-6 border-t bg-background px-6 py-3 flex items-center justify-end gap-2">
					<Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Lead')}
					</Button>
				</div>
			</form>
		</div>
	)
}
