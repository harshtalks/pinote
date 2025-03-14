"use client";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChangeEvent, ComponentPropsWithoutRef, useRef } from "react";
import { useNotebookLofiStore, notebookQueries } from "@/lofi/notebooks/*";
import { pipe } from "effect";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { Branded } from "@/types/*";
import { useSubscribe } from "replicache-react";

export function TitleInput({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  const localStore = useNotebookLofiStore();
  const { notebookId, workspaceId } = NotebookIdPageRoute.useParams();
  const notebook = useSubscribe(localStore, (tx) =>
    pipe(notebookId, Branded.NotebookId, (id) =>
      notebookQueries.read(tx, Branded.WorkspaceId(workspaceId), id),
    ),
  );

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

    localStore?.mutate.updateNotebook({
      title: e.currentTarget.value,
      id: notebookId,
      updatedAt: Date.now(),
      workspaceId: Branded.WorkspaceId(workspaceId),
    });
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <Textarea
      id="textarea-19"
      value={notebook?.title || ""}
      placeholder="Untitled"
      ref={textareaRef}
      onChange={handleInput}
      rows={defaultRows}
      onKeyDown={onKeyPress}
      {...props}
      className={cn(
        "border-0 p-0 shadow-none placeholder:text-neutral-400 focus-visible:ring-0 font-semibold placeholder:font-semibold placeholder:text-3xl !text-3xl min-h-[none] resize-none",
        className,
      )}
    />
  );
}
