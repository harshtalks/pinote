"use client";
import WorkspaceIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/route.info";
import { Member, Notebook, User, Workspace } from "@/db/schema/*";
import { Array, pipe } from "effect";
import { Merge } from "ts-essentials";
import { RelativeDate } from "../global/relative-date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { If } from "@/wrappers/if";

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
  return (
    <WorkspaceIdPageRoute.Link
      params={{ workspaceId: workspace.id }}
      className="relative flex items-start focus:outline-none transition-all focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-foreground gap-2 rounded-lg w-full border border-input p-4 hover:border-ring"
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
        <button className="flex items-center hover:shadow-sm hover:border-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 transition-all w-fit rounded-full border border-border bg-background p-1">
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
        </button>
      </div>
    </WorkspaceIdPageRoute.Link>
  );
};

export default SelectWorkspace;
