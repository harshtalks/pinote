// Key Value List after title input in the notebook.
"use client";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { Icon } from "@/components/ui/icon";
import { useNotebookLofiStore } from "@/lofi/notebooks/notebook.provider";
import { notebookQueries } from "@/lofi/notebooks/notebook.queries";
import { Branded } from "@/types/*";
import { Option, pipe } from "effect";
import { useSubscribe } from "replicache-react";

export const KeyValue = () => {
  const { notebookId } = NotebookIdPageRoute.useParams();
  const localStore = useNotebookLofiStore();
  const notebook = useSubscribe(localStore, (tx) =>
    pipe(notebookId, Branded.NotebookId, (id) => notebookQueries.read(tx, id)),
  );

  return Option.fromNullable(notebook).pipe(
    Option.match({
      onSome: () => (
        <table className="w-full text-sm">
          <tbody className="space-y-4">
            {notebook?.kvs.map((kv) => (
              <tr key={kv.key} className="grid grid-cols-2 items-center">
                <td className="text-neutral-400 font-medium flex items-center gap-2">
                  <Icon name={kv.icon} /> {kv.key}
                </td>
                <td className="font-semibold">{kv.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
      onNone: () => <div>loading...</div>,
    }),
  );
};
