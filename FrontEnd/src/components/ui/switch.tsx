import * as React from "react"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => {
          onCheckedChange?.(e.target.checked)
        }}
        className="peer sr-only"
        {...props}
      />
      <div className="relative h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600">
        <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  )
)
Switch.displayName = "Switch"

export { Switch }
