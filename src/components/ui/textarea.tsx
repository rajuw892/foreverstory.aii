"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border-2 border-white/30 bg-white/50 backdrop-blur-sm px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sakura-400 focus-visible:ring-offset-2 focus-visible:border-sakura-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 resize-none dark:bg-[#1E293B]/90 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-purple-400 dark:focus-visible:border-purple-300/70",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
