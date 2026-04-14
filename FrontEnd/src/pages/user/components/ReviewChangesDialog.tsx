import { Loader2, ArrowRight, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ReviewChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  isPending: boolean
  onConfirm: () => void
  children: React.ReactNode
}

export function ReviewChangesDialog({
  open,
  onOpenChange,
  title,
  isPending,
  onConfirm,
  children,
}: ReviewChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Please review the changes before confirming.
          </p>
          {children}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="bg-linear-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm & Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DiffDisplayProps {
  label: string
  oldValue: React.ReactNode
  newValue: React.ReactNode
  icon?: React.ReactNode
}

export function DiffDisplay({
  label,
  oldValue,
  newValue,
  icon,
}: DiffDisplayProps) {
  if (oldValue?.toString() === newValue?.toString()) {
    return
  }
  return (
    <div className="space-y-2 rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-red-500 line-through">{oldValue}</span>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="flex items-center gap-1">
          {icon && icon}
          <span className="text-green-600">{newValue}</span>
        </div>
      </div>
    </div>
  )
}
