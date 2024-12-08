"use client";

import { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BubbleMenu, isNodeSelection } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BoldIcon,
  Highlighter,
  ItalicIcon,
  Trash2,
  Underline,
} from "lucide-react";
import { useNotebookEditorCtx } from "@/editor/editor.ctx";

export const BubbleMenuBtn = (
  props: ComponentPropsWithoutRef<typeof Button> & {
    active?: boolean;
  },
) => {
  return (
    <Button
      {...props}
      variant="ghost"
      className={cn(
        "border border-transparent p-2",
        props.active && "bg-zinc-100 border-zinc-200",
        props.className,
      )}
    >
      {props.children}
    </Button>
  );
};

export const BubbleMenuWrapper = () => {
  const editor = useNotebookEditorCtx();

  return (
    <BubbleMenu
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        const { empty } = selection;

        // don't show bubble menu if:
        // - the editor is not editable
        // - the selected node is an image
        // - the selection is empty
        // - the selection is a node selection (for drag handles)
        if (
          !editor.isEditable ||
          editor.isActive("image") ||
          empty ||
          isNodeSelection(selection)
        ) {
          return false;
        }
        return true;
      }}
      editor={editor}
      tippyOptions={{ duration: 100 }}
    >
      <div className="bg-zinc-50 p-1 flex items-center gap-1 shadow-[rgba(100,_100,_111,_0.2)_0px_7px_29px_0px] rounded-lg">
        <BubbleMenuBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <BoldIcon className="shrink-0 size-4" />
        </BubbleMenuBtn>

        <BubbleMenuBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <ItalicIcon className="shrink-0 size-4" />
        </BubbleMenuBtn>
        <BubbleMenuBtn
          onClick={() =>
            editor && editor.chain().focus().toggleUnderline().run()
          }
          active={editor.isActive("underline")}
        >
          <Underline className="shrink-0 size-4" />
        </BubbleMenuBtn>
        <BubbleMenuBtn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        >
          <Highlighter className="shrink-0 size-4" />
        </BubbleMenuBtn>
        <BubbleMenuBtn
          onClick={() => {
            editor.chain().focus().setTextAlign("left").run();
          }}
          active={editor.isActive({
            textAlign: "left",
          })}
        >
          <AlignLeft className="shrink-0 size-4" />
        </BubbleMenuBtn>
        <BubbleMenuBtn
          onClick={() => {
            editor.chain().focus().setTextAlign("center").run();
          }}
          active={editor.isActive({
            textAlign: "center",
          })}
        >
          <AlignCenter className="shrink-0 size-4" />
        </BubbleMenuBtn>
        <BubbleMenuBtn
          onClick={() => {
            editor.chain().focus().setTextAlign("right").run();
          }}
          active={editor.isActive({
            textAlign: "right",
          })}
        >
          <AlignRight className="shrink-0 size-4" />
        </BubbleMenuBtn>

        <BubbleMenuBtn
          onClick={() => {
            editor.chain().focus().deleteSelection().run();
          }}
        >
          <Trash2 className="shrink-0 size-4" />
        </BubbleMenuBtn>
      </div>
    </BubbleMenu>
  );
};
