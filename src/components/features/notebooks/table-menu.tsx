"use client";

import { BubbleMenu, Editor } from "@tiptap/react";
import { Columns3, Rows, Rows3, Trash2 } from "lucide-react";
import { BubbleMenuBtn } from "./bubble-menu";
import { useNotebookEditorCtx } from "@/editor/editor.ctx";

const tableMenuBtns = [
  {
    icon: Rows,
    label: "Toggle Header",
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleHeaderRow().run();
    },
  },
  {
    icon: Columns3,
    label: "Add Column After",
    onClick: (editor: Editor) => {
      editor.chain().focus().addColumnBefore().run();
    },
  },
  {
    icon: Columns3,
    label: "Add Column Before",
    onClick: (editor: Editor) => {
      editor.chain().focus().addColumnBefore().run();
    },
  },
  {
    icon: Rows3,
    label: "Add Row After",
    onClick: (editor: Editor) => {
      editor.chain().focus().addRowAfter().run();
    },
  },
  {
    icon: Rows3,
    label: "Add Row Before",
    onClick: (editor: Editor) => {
      editor.chain().focus().addRowBefore().run();
    },
  },
  {
    icon: Trash2,
    label: "Delete Column",
    onClick: (editor: Editor) => {
      editor.chain().focus().deleteColumn().run();
    },
  },
  {
    icon: Trash2,
    label: "Delete Row",
    onClick: (editor: Editor) => {
      editor.chain().focus().deleteRow().run();
    },
  },
  {
    icon: Trash2,
    label: "Delete Table",
    onClick: (editor: Editor) => {
      editor.chain().focus().deleteTable().run();
    },
  },
];

const TableMenu = () => {
  const editor = useNotebookEditorCtx();

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        let depth = selection.$anchor.depth;
        while (depth > 0) {
          const node = selection.$anchor.node(depth);
          if (["table", "tableCell", "tableRow"].includes(node.type.name)) {
            return true;
          }
          depth--;
        }
        return false;
      }}
    >
      <div className="bg-zinc-50 p-2 flex flex-col items-stretch gap-1 shadow-[rgba(100,_100,_111,_0.2)_0px_7px_29px_0px] rounded-lg">
        {tableMenuBtns.map((btn, i) => (
          <BubbleMenuBtn
            key={i}
            className="text-xs px-2 py-2 text-muted-foreground w-full prose-td:border prose-thead:bold rounded-md inline-flex gap-2 justify-start items-center hover:bg-zinc-100"
            onClick={() => btn.onClick(editor)}
          >
            <btn.icon className="shrink-0 size-3.5" />
            {btn.label}
          </BubbleMenuBtn>
        ))}
      </div>
    </BubbleMenu>
  );
};

export default TableMenu;
