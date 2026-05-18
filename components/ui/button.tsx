import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary shadow-lg hover:opacity-95 rounded-full font-sans",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold cursor-pointer transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-all duration-300 font-bold cursor-pointer",
        ghost: "text-primary hover:bg-accent transition-all font-bold cursor-pointer duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        blue: "bg-primary text-primary-foreground rounded-full text-base hover:bg-primary/80 active:bg-primary transition-all duration-300 font-bold cursor-pointer rounded-full",
        inverted:
          "bg-background text-primary hover:bg-background/90 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 font-bold cursor-pointer",
        mulearn:
          "lc-gradient-cta text-primary-foreground shadow-lg hover:shadow-xl font-bold cursor-pointer transition-all duration-300 rounded-full",
        purple:
          "bg-chart-4 text-primary-foreground hover:bg-chart-4/80 shadow-lg hover:shadow-xl transition-all duration-300 font-bold cursor-pointer",
        trusty:
          "lc-gradient-cta text-primary-foreground shadow-lg hover:shadow-2xl transition-all duration-300 font-bold cursor-pointer",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const { popover: _popover, ...restProps } = props as Record<string, unknown>;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...restProps}
    />
  );
}

export { Button, buttonVariants };
