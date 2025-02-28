"use client";
import { useNotebookLofiStore } from "@/lofi/notebooks/notebook.provider";
import { notebookQueries } from "@/lofi/notebooks/*";
import { GridIcon, PlusIcon } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { Array, Option, Order, pipe } from "effect";
import { cn } from "@/lib/utils";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { useRouter } from "next/navigation";
import { Branded } from "@/types/*";
import { PrefixedIDs } from "@/db/schema/schema.helper";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Notebook } from "@/db/schema/*";

const NotebookTabs = () => {
  const localStore = useNotebookLofiStore();
  const { notebookId, workspaceId } = NotebookIdPageRoute.useParams();
  const tabs = useSubscribe(localStore, (tx) =>
    notebookQueries.readAll(tx, Branded.WorkspaceId(workspaceId)),
  );
  const router = useRouter();
  const me = api.user.me.useQuery();

  const addNotebook = () => {
    if (!me.data || !localStore) {
      return;
    }

    localStore.mutate
      .createNotebook({
        createdAt: Date.now(),
        updatedAt: Date.now(),
        creatorId: me.data.id,
        id: PrefixedIDs.notebook(),
        kvs: [
          {
            key: "Created At",
            icon: "accessibility",
            value: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            }),
          },
          {
            key: "Updated At",
            icon: "accessibility",
            value: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            }),
          },
        ],
        lastModifiedAt: Branded.LastModified(new Date().toISOString()),
        nodes: "",
        title: "Untitled",
        workspaceId: workspaceId,
      })
      .then((d) => {
        router.push(
          NotebookIdPageRoute.navigate({
            workspaceId: workspaceId,
            notebookId: d.id,
          }),
        );
      });
  };

  return Option.fromNullable(tabs).pipe(
    Option.match({
      onSome: (tabs) => (
        <div className="flex items-center gap-4">
          {pipe(
            tabs,
            Array.sort(
              pipe(
                Order.number,
                Order.mapInput((x: Notebook) => x.createdAt || 0),
              ),
            ),
            Array.map((each) => (
              <NotebookIdPageRoute.Link
                params={{
                  notebookId: each.id,
                  workspaceId,
                }}
                key={each.id}
                className={cn(
                  "bg-gray-50 inline-flex items-center transition-all duration-200 gap-2 text-xs rounded-lg border px-4 py-2 hover:bg-gray-200 focus:outline-none focus-visible:ring-gray-400 focus-visible:ring-2 focus-visible:ring-offset-2",
                  each.id === notebookId ? "outline outline-gray-400 " : "",
                )}
              >
                <GridIcon size={16} /> {each.title}
              </NotebookIdPageRoute.Link>
            )),
          )}
          <Button variant={"ghost"} onClick={addNotebook}>
            <PlusIcon />
          </Button>
        </div>
      ),
      onNone: () => null,
    }),
  );
};

export default NotebookTabs;
