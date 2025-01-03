import { Settings } from "@/components/features/workspaces/settings";
import { NoteBookLofiStoreProvider } from "@/lofi/notebooks/notebook.provider";
import { api } from "@/trpc/server";
import { Branded } from "@/types/*";
import { ReactNode } from "react";

const WorkspacesLayout = async ({ children }: { children: ReactNode }) => {
  const { id: userId } = await api.user.me();
  return (
    <NoteBookLofiStoreProvider userId={Branded.UserId(userId)}>
      <div>
        {children}
        <Settings />
      </div>
    </NoteBookLofiStoreProvider>
  );
};

export default WorkspacesLayout;
