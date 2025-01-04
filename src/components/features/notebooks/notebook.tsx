"use client";

import { NotebookEditorProvider } from "@/editor/editor.ctx";
import useNotebookEditor from "@/editor/editor.hook";
import { SlashCmdProvider } from "@harshtalks/slash-tiptap";
import { Effect, Match } from "effect";
import Playground from "./playground";
import { useNotebookLofiStore } from "@/lofi/notebooks/notebook.provider";
import { useEffect } from "react";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { pipe } from "effect";
import { Branded } from "@/types/*";
import { notebookQueries } from "@/lofi/notebooks/notebook.queries";

const Notebook = () => {
  const { editor } = useNotebookEditor();
  const localNotebookStore = useNotebookLofiStore();
  const { notebookId } = NotebookIdPageRoute.useParams();

  useEffect(() => {
    pipe(localNotebookStore, (store) =>
      store.query((tx) =>
        pipe(notebookId, Branded.NotebookId, (id) =>
          Effect.promise(() => notebookQueries.read(tx, id)).pipe(
            Effect.andThen((data) =>
              editor?.commands.setContent(data?.nodes || ""),
            ),
            Effect.runPromise,
          ),
        ),
      ),
    );
  }, [localNotebookStore, notebookId, editor]);

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
