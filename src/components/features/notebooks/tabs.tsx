"use client";
import { useNotebookLofiStore } from "@/lofi/notebooks/notebook.provider";
import { notebookQueries } from "@/lofi/notebooks/*";
import { GridIcon, PlusIcon } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { Array, Option, pipe } from "effect";

const NotebookTabs = () => {
  const localStore = useNotebookLofiStore();
  const tabs = useSubscribe(localStore, notebookQueries.readAll);

  return Option.fromNullable(tabs).pipe(
    Option.match({
      onSome: (tabs) => (
        <div className="flex items-center gap-4">
          {pipe(
            tabs,
            Array.map((each) => (
              <button
                key={each.id}
                className="bg-gray-50 inline-flex items-center gap-2 text-xs rounded-lg border px-4 py-2"
              >
                <GridIcon size={16} /> {each.title}
              </button>
            )),
          )}
          <button>
            <PlusIcon />
          </button>
        </div>
      ),
      onNone: () => null,
    }),
  );
};

export default NotebookTabs;
