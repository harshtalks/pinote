// Editor Context

import { Editor } from "@tiptap/react";
import React, { ReactNode, createContext } from "react";

export const NotebookEditorContext = createContext<Editor | null>(null);

export interface NotebookEditorProviderProps {
  children: ReactNode;
  editor: Editor;
}

export function NotebookEditorProvider({
  children,
  editor,
}: NotebookEditorProviderProps) {
  return (
    <NotebookEditorContext.Provider value={editor}>
      {children}
    </NotebookEditorContext.Provider>
  );
}

export const useNotebookEditorCtx = () => {
  const editor = React.useContext(NotebookEditorContext);
  if (!editor) {
    throw new Error(
      "useNotebookEditor must be used within a <NotebookEditorProvider>",
    );
  }
  return editor;
};
