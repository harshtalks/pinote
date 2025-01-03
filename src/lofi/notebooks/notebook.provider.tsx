"use client";
import localFirstStoreCreator from "../create-lofi-store";
import { notebookMutators } from "./notebook.mutators";

export const {
  Provider: NoteBookLofiStoreProvider,
  storeContext: notebookLofiStoreContext,
  useLocalFirst: useNotebookLofiStore,
} = localFirstStoreCreator({
  key: "notebook",
  mutators: notebookMutators,
});
