"use client";

import { NotebookEditorProvider } from "@/editor/editor.ctx";
import useNotebookEditor from "@/editor/editor.hook";
import { SlashCmdProvider } from "@harshtalks/slash-tiptap";
import { Match } from "effect";
import Playground from "./playground";

const Notebook = () => {
  const { editor } = useNotebookEditor();

  return Match.value(editor).pipe(
    Match.when(null, () => null),
    Match.orElse((editor) => (
      <SlashCmdProvider>
        <NotebookEditorProvider editor={editor}>
          <Playground />
        </NotebookEditorProvider>
      </SlashCmdProvider>
    )),
  );
};

export default Notebook;
