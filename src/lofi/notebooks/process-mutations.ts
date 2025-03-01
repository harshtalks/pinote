// process mutation on the server
// save in DB

import { Match, pipe } from "effect";
import { MutationV1 } from "replicache";
import { NotebookMutatorKeys } from "./notebook.mutators";
import { Merge } from "ts-essentials";
import { Notebook } from "@/db/schema/*";
import { notebookRepo } from "@/repositories/*";

export const processNotebookMutation = (
  mutation: Merge<MutationV1, { name: NotebookMutatorKeys; args: Notebook }>,
) =>
  pipe(
    mutation,
    Match.value,
    Match.when({ name: "createNotebook" }, ({ args: notebook }) =>
      notebookRepo.addNewNotebook(notebook),
    ),
    Match.when({ name: "updateNotebook" }, ({ args }) =>
      notebookRepo.updateNotebook({ ...args, version: args.version + 1 }),
    ),
    Match.exhaustive,
  );
