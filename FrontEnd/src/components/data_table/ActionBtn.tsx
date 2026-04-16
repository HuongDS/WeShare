import * as React from "react";
import type { ReactNode } from "react";
import { TooltipWrapper } from "@/components/TooltipWrapper.tsx";

interface ActionBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  disabled?: boolean;
  tooltipText: string;
}

const ActionBtn = React.forwardRef<HTMLButtonElement, ActionBtnProps>(
  ({ icon, className, disabled, tooltipText, ...props }, ref) => {
    return (
      <TooltipWrapper content={tooltipText}>
        <button
          disabled={disabled}
          ref={ref}
          className={`p-2 rounded cursor-pointer hover:bg-accent bg-transparent transition border border-border outline-none! ${className ?? ""}`}
          {...props}
        >
          {icon}
        </button>
      </TooltipWrapper>
    );
  },
);

ActionBtn.displayName = "ActionBtn";

export default ActionBtn;
