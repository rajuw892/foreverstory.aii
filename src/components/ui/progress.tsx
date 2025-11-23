"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-white/30 backdrop-blur-sm dark:bg-[#1E293B]/80",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-sakura-400 via-sakura-500 to-sakura-600 transition-all duration-500 ease-out rounded-full shadow-lg shadow-sakura-500/50 dark:from-[#A78BFA] dark:via-[#60A5FA] dark:to-[#22D3EE] dark:shadow-[0_0_18px_rgba(96,165,250,0.35)]"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
