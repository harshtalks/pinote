"use client";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useNotebookLofiStore, notebookQueries } from "@/lofi/notebooks/*";
import { pipe } from "effect";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { Branded } from "@/types/*";

export function TitleInput({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);
  const localStore = useNotebookLofiStore();
  const { notebookId } = NotebookIdPageRoute.useParams();

  useEffect(() => {
    if (localStore) {
      localStore.subscribe(
        (tx) =>
          pipe(notebookId, Branded.NotebookId, (id) =>
            notebookQueries.read(tx, id),
          ),
        {
          onData: (data) => {
            if (data?.title) {
              setValue(data.title);
            }
          },
        },
      );
    }
  }, [localStore, notebookId]);

  useEffect(() => {
    if (localStore) {
      localStore.mutate.updateNotebook({
        title: debouncedValue,
        id: notebookId,
        createdAt: Date.now(),
      });
    }
  }, [debouncedValue, localStore, notebookId]);

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

    setValue(textarea.value);
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <Textarea
      id="textarea-19"
      value={value}
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
