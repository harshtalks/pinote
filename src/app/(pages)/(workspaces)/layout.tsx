import { Settings } from "@/components/features/workspaces/settings";
import { NoteBookLofiStoreProvider } from "@/lofi/notebooks/notebook.provider";
import { api } from "@/trpc/server";
import { Branded } from "@/types/*";
import { ReactNode } from "react";
import WorkspacesPageRoute from "./workspaces/route.info";
import { AuthInterceptor } from "@/auth/interceptor";
import { headers } from "next/headers";

const WorkspacesLayout = async ({ children }: { children: ReactNode }) => {
  await new AuthInterceptor()
    .setPath(WorkspacesPageRoute.navigate())
    .setHeaders(await headers())
    .setBase()
    .execute();

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
