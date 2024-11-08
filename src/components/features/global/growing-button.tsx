import { cn } from "@/lib/utils";
import { ChevronDown, SparklesIcon } from "lucide-react";
import { ComponentProps } from "react";

export function GrowingButton({
  icon: Icon,
  className,
  ...props
}: ComponentProps<"button"> & {
  icon: typeof SparklesIcon;
}) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "group flex transform-gpu items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-neutral-400/15 active:bg-neutral-400/25 focus-visible:bg-neutral-400/25 focus-visible:outline-none",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4 text-neutral-400" />
      <ChevronDown aria-hidden="true" className="size-4 text-neutral-400" />
    </button>
  );
}
