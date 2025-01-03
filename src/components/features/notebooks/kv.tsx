// Key Value List after title input in the notebook.
"use client";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { useNotebookLofiStore } from "@/lofi/notebooks/notebook.provider";
import { notebookQueries } from "@/lofi/notebooks/notebook.queries";
import { api } from "@/trpc/client";
import { Branded, LucideIcon } from "@/types/*";
import { Match, Option, pipe } from "effect";
import { Calendar, CalendarSearch, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubscribe } from "replicache-react";

export type KeyValue = {
  key: string;
  value: string;
  icon: LucideIcon;
};

export const keyvalues: KeyValue[] = [
  {
    key: "Created",
    value: "01/15/2024 11:29:23 AM",
    icon: Calendar,
  },
  {
    key: "Url",
    icon: Link,
    value: "https://google.com/ahss/sdnksd",
  },
  {
    key: "Updated",
    icon: CalendarSearch,
    value: "01/15/2024 11:29:23 AM",
  },
];

export const KeyValue = ({ keyvalues }: { keyvalues: KeyValue[] }) => {
  const { notebookId } = NotebookIdPageRoute.useParams();
  const localStore = useNotebookLofiStore();
  const notebook = useSubscribe(localStore, (tx) =>
    pipe(notebookId, Branded.NotebookId, (id) => notebookQueries.read(tx, id)),
  );

  return Option.fromNullable(notebook).pipe(
    Option.match({
      onSome: (notebook) => (
        <table className="w-full text-sm">
          <tbody className="space-y-4">
            {keyvalues.map((kv) => (
              <tr key={kv.key} className="grid grid-cols-2 items-center">
                <td className="text-neutral-400 font-medium flex items-center gap-2">
                  <kv.icon size={20} /> {kv.key}
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
