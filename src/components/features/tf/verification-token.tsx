"use client";

import { Input } from "@/components/ui/input";
import { useIsCopied } from "@/hooks/*";
import { cn } from "@/lib/utils";
import { Redacted } from "effect";
import { Check, Copy } from "lucide-react";

export const VerificationToken = ({
  token,
}: {
  token: Redacted.Redacted<string>;
}) => {
  const { copyToClipboard, isCopied } = useIsCopied();

  return (
    <div className="flex rounded-lg shadow-sm shadow-black/5">
      <Input
        id="input-20"
        className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
        placeholder="text"
        disabled
        value={Redacted.value(token)}
      />
      <button
        onClick={() => copyToClipboard(Redacted.value(token))}
        className={cn(
          "inline-flex w-9 items-center justify-center rounded-e-lg border border-input bg-background text-sm text-muted-foreground/80 ring-offset-background transition-shadow hover:bg-accent hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          isCopied && "text-green-500 hover:text-green-500",
        )}
        aria-label="Subscribe"
      >
        {isCopied ? (
          <Check size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Copy size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
