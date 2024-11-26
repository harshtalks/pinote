"use client";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChangeEvent, ComponentPropsWithoutRef, useRef } from "react";

export function TitleInput({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const defaultRows = 1;
  const maxRows = undefined; // You can set a max number of rows

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";

    const style = window.getComputedStyle(textarea);
    const borderHeight =
      parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
    const paddingHeight =
      parseInt(style.paddingTop) + parseInt(style.paddingBottom);

    const lineHeight = parseInt(style.lineHeight);
    const maxHeight = maxRows
      ? lineHeight * maxRows + borderHeight + paddingHeight
      : Infinity;

    const newHeight = Math.min(textarea.scrollHeight + borderHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
  };

  return (
    <Textarea
      id="textarea-19"
      placeholder="Untitled"
      ref={textareaRef}
      onChange={handleInput}
      rows={defaultRows}
      {...props}
      className={cn(
        "border-0 p-0 shadow-none placeholder:text-neutral-400 focus-visible:ring-0 font-semibold placeholder:font-semibold placeholder:text-3xl !text-3xl min-h-[none] resize-none",
        className,
      )}
    />
  );
}
