"use client";

import { NotebookEditorProvider } from "@/editor/editor.ctx";
import useNotebookEditor from "@/editor/editor.hook";
import { SlashCmdProvider } from "@harshtalks/slash-tiptap";
import { Effect, Match } from "effect";
import Playground from "./playground";
import { useNotebookLofiStore } from "@/lofi/notebooks/notebook.provider";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { pipe } from "effect";
import { Branded } from "@/types/*";
import { notebookQueries } from "@/lofi/notebooks/notebook.queries";
import { useActionLocalStore } from "@/hooks/subscribe-local-store";

const Notebook = () => {
  const { editor } = useNotebookEditor();
  const localNotebookStore = useNotebookLofiStore();
  const { notebookId, workspaceId } = NotebookIdPageRoute.useParams();

  useActionLocalStore(
    localNotebookStore,
    (store) =>
      store.query((tx) =>
        pipe(
          notebookId,
          Branded.NotebookId, // Branded.NotebookId
          (id) =>
            Effect.promise(() =>
              notebookQueries.read(tx, Branded.WorkspaceId(workspaceId), id),
            ).pipe(
              Effect.andThen((data) =>
                pipe(
                  data,
                  Match.value,
                  Match.when(undefined, () => {
                    // do nothing
                  }),
                  Match.orElse((data) =>
                    editor?.commands.setContent(data.nodes),
                  ),
                ),
              ),
              Effect.runPromise,
            ),
        ),
      ),
    [notebookId, editor],
  );

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
