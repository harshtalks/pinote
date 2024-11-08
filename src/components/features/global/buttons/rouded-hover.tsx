"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { ComponentProps } from "react";

export const RoundedHoverBtn = ({
  className,
  children,
  ...props
}: ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex font-cal  tracking-wide h-[calc(48px+8px)] items-center justify-center rounded-full bg-foreground text-background py-1 pl-6 pr-14 font-medium",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-background focus-visible:ring-muted-foreground focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="z-10 pr-2">{children}</span>
      <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-neutral-700 dark:bg-neutral-200 transition-[width] group-hover:w-[calc(100%-8px)]">
        <div className="mr-3.5 flex items-center justify-center">
          <ChevronRight className="shrink-0 text-background size-4" />
        </div>
      </div>
    </button>
  );
};
