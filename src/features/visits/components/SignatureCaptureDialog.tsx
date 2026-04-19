import { useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'
import { Camera } from 'lucide-react'
import { useCaptureSignature } from '@/api/endpoints/visits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'

interface SignatureCaptureDialogProps {
  open: boolean
  visitId: string
  onClose: () => void
}

export function SignatureCaptureDialog({ open, visitId, onClose }: SignatureCaptureDialogProps) {
  const { mutate: captureSignature, isPending } = useCaptureSignature()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [capturedByName, setCapturedByName] = useState('')
  const [capturedByTitle, setCapturedByTitle] = useState('')

  useEffect(() => {
    if (!open || !canvasRef.current) return
    const canvas = canvasRef.current
    const ratio = Math.max(window.devicePixelRatio ?? 1, 1)
    // Read CSS dimensions BEFORE setting .width/.height — writing to them resets the bitmap
    const cssWidth = canvas.offsetWidth
    const cssHeight = canvas.offsetHeight
    canvas.width = cssWidth * ratio
    canvas.height = cssHeight * ratio
    canvas.getContext('2d')?.scale(ratio, ratio)

    const pad = new SignaturePad(canvas, { backgroundColor: 'rgb(255,255,255)' })
    pad.addEventListener('endStroke', () => setIsEmpty(pad.isEmpty()))
    padRef.current = pad

    return () => {
      pad.off()
      padRef.current = null
    }
  }, [open])

  if (!open) return null

  function handleClear() {
    padRef.current?.clear()
    setIsEmpty(true)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !padRef.current) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      await padRef.current!.fromDataURL(dataUrl, { ratio: Math.max(window.devicePixelRatio ?? 1, 1) })
      setIsEmpty(false)
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  function handleSubmit() {
    if (!padRef.current || padRef.current.isEmpty()) return
    captureSignature(
      {
        id: visitId,
        signatureImageUrl: padRef.current.toDataURL('image/png'),
        capturedByName: capturedByName.trim() || undefined,
        capturedByTitle: capturedByTitle.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast('Signature captured', { variant: 'success' })
          onClose()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-md space-y-4 p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Capture Signature</h2>
          <p className="text-sm text-muted-foreground">Have the customer sign below to confirm the visit.</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Signature <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Camera className="h-3 w-3" />
                Upload / Photo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear
              </button>
            </div>
          </div>
          {/* Hidden file input — accept images from camera or gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <canvas
            ref={canvasRef}
            className="w-full h-36 rounded-lg border border-border bg-white touch-none cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
          {isEmpty && (
            <p className="text-xs text-muted-foreground">Draw signature above, or use Upload / Photo</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="sig-name" className="text-xs font-medium text-muted-foreground">Signer Name</Label>
            <Input
              id="sig-name"
              placeholder="e.g. Dr. Maria Santos"
              value={capturedByName}
              onChange={(e) => setCapturedByName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sig-title" className="text-xs font-medium text-muted-foreground">Signer Title</Label>
            <Input
              id="sig-title"
              placeholder="e.g. Cardiologist"
              value={capturedByTitle}
              onChange={(e) => setCapturedByTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isEmpty || isPending}>
            {isPending ? 'Saving…' : 'Save Signature'}
          </Button>
        </div>
      </div>
    </div>
  )
}
