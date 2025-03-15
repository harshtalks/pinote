"use client";
import { Member, Notebook, User, Workspace } from "@/db/schema/*";
import { Array, Option, pipe } from "effect";
import { Merge } from "ts-essentials";
import { RelativeDate } from "../global/relative-date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { If } from "@/wrappers/if";
import { api } from "@/trpc/client";
import NotebookIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/notebooks/[notebookId]/route.info";
import { useRouter } from "next/navigation";
import { PrefixedIDs } from "@/db/schema/schema.helper";
import { useNotebookLofiStore } from "@/lofi/notebooks/*";
import { toast } from "sonner";

const SelectWorkspace = ({
  workspace,
}: {
  workspace: Merge<
    Workspace,
    {
      members: Array<Merge<Member, { user: User }>>;
      notebooks: Array<Notebook>;
    }
  >;
}) => {
  const localStore = useNotebookLofiStore();
  const me = api.user.me.useQuery();
  const router = NotebookIdPageRoute.useRouter(useRouter);

  return (
    <button
      className="relative flex items-start focus:outline-none transition-all focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-foreground gap-2 rounded-lg w-full border border-input p-4 hover:border-ring"
      onClick={async () => {
        if (!me.isSuccess || !localStore) {
          toast.error("There is a problem while creating a notebook");
          return;
        }

        pipe(
          workspace.members,
          Array.findFirst((el) => el.userId === me.data.id),
        ).pipe(
          Option.match({
            onSome: (member) => {
              localStore.mutate
                .createNotebook({
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  creatorId: member.id,
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
                        timeZoneName: "short",
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
                        timeZoneName: "short",
                      }),
                    },
                  ],
                  nodes: "",
                  title: "",
                  workspaceId: workspace.id,
                  version: 0,
                })
                .then((d) => {
                  router.push({
                    params: {
                      notebookId: d.id,
                      workspaceId: workspace.id,
                    },
                  });
                });
            },
            onNone: () => {
              toast.error("You are not a member of this workspace");
            },
          }),
        );
      }}
    >
      <div className="grid grow gap-2">
        <div className="flex items-center justify-between">
          <p>
            {workspace.name}{" "}
            <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
              ({workspace.isPrivate ? "Private" : "Public"})
            </span>
          </p>
          <div className="text-xs text-muted-foreground">
            <RelativeDate date={workspace.createdAt} />
          </div>
        </div>
        <p
          id="radio-08-r2-description"
          className="text-xs text-start text-muted-foreground"
        >
          {workspace.description}
        </p>
        <div
          tabIndex={0}
          className="flex items-center hover:shadow-sm hover:border-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 transition-all w-fit rounded-full border border-border bg-background p-1"
        >
          <div className="flex -space-x-3">
            {pipe(
              workspace.members,
              Array.take(3),
              Array.map((workspace) => (
                <Avatar className="size-4" key={workspace.id}>
                  <AvatarFallback></AvatarFallback>
                  {workspace.user.avatar && (
                    <AvatarImage
                      src={workspace.user.avatar}
                      alt={workspace.user.name}
                    />
                  )}
                  <If
                    value={workspace.user.name}
                    condition={(value) => !!value}
                  >
                    {(value) => (
                      <AvatarImage src={value} alt={workspace.user.name} />
                    )}
                  </If>
                </Avatar>
              )),
            )}
          </div>
          {pipe(
            workspace.members,
            (arr) => arr.length,
            (len) =>
              len > 3 ? (
                <span className="flex h-fit items-center justify-center bg-transparent px-2 text-xs text-muted-foreground shadow-none hover:bg-transparent group-hover:text-foreground">
                  +{len - 3}
                </span>
              ) : null,
          )}
        </div>
      </div>
    </button>
  );
};

export default SelectWorkspace;
