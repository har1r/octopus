// src/components/ui/progress.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

function Progress({ className, value = 0, style, ...props }: ProgressProps) {
  const customBg = style && (style as any)['--progress-background'];

  return (
    <div
      className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-[#EAEAEA]", className)}
      style={style}
      {...props}
    >
      <div
        className="h-full transition-all rounded-full"
        style={{ 
          width: `${Math.min(100, Math.max(0, value || 0))}%`, 
          backgroundColor: customBg || '#FF385C'
        }}
      />
    </div>
  )
}

export { Progress }
