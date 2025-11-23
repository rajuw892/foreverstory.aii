"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "gradient-primary text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 btn-hover-lift",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-purple-300 bg-transparent text-purple-600 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-300/60 dark:text-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:border-purple-200/70",
        secondary:
          "glass text-gray-800 hover:bg-white/90 hover:shadow-xl dark:text-[#F1F5F9] dark:hover:bg-[#1E293B]/90 dark:shadow-purple-500/10",
        ghost:
          "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-[#1E293B] dark:hover:text-[#F1F5F9]",
        link:
          "text-purple-500 underline-offset-4 hover:underline",
        magic:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 animate-gradient bg-[length:200%_200%]",
        glow:
          "gradient-primary text-white pulse-glow hover:scale-105",
        gold:
          "gradient-secondary text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-2xl px-8 text-lg",
        xl: "h-16 rounded-2xl px-10 text-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
