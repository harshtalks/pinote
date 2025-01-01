import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/server";
import { AddNewWorkspace } from "./add-new-workspace";
import { Result } from "@/utils/*";
import { Array, Match, pipe } from "effect";
import { ArrowRight, CircleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RelativeDate } from "../global/relative-date";
import WorkspaceIdPageRoute from "@/app/(pages)/(workspaces)/workspaces/[workspaceId]/route.info";

export const Workspace = async () => {
  const user = await api.user.me();
  const workspaces = await api.workspace.workspaces();
  console.log(workspaces);

  return (
    <div className="max-w-xl space-y-12 py-24 mx-auto">
      <div className="space-y-4">
        <Avatar className="size-24">
          <AvatarFallback>{user.name[0]}</AvatarFallback>
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        </Avatar>
        <div>
          <h1 className="text-5xl font-cal">Hello, {user.name}!</h1>
        </div>
      </div>
      {Result.match(workspaces, {
        onErr: (err) =>
          Match.value(err).pipe(
            Match.when(
              (err) => err._tag === "NotFoundError",
              () => (
                <div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-cal">
                      Create your first workspace
                    </h2>
                    <p>
                      You can invite people on to your workspaces with the link
                      shared.
                    </p>
                  </div>
                  <AddNewWorkspace />
                </div>
              ),
            ),
            Match.orElse((err) => (
              <div className="max-w-[400px] rounded-lg border border-border bg-background px-4 py-3 shadow-lg shadow-black/5">
                <div className="flex gap-2">
                  <div className="flex grow gap-3">
                    <CircleAlert
                      className="mt-0.5 shrink-0 text-red-500"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <div className="flex grow justify-between gap-12">
                      <p className="text-sm">{err.message}</p>
                      <a
                        href="#"
                        className="group whitespace-nowrap text-sm font-medium"
                      >
                        Link
                        <ArrowRight
                          className="-mt-0.5 ms-1 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
                          size={16}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                    aria-label="Close banner"
                  >
                    <X
                      size={16}
                      strokeWidth={2}
                      className="opacity-60 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
            )),
          ),
        onOk: (workspaces) => (
          <div className="space-y-8 mx-auto max-w-xl">
            <AddNewWorkspace />
            <div className="space-y-2">
              {pipe(
                workspaces,
                Array.map((each) => (
                  <WorkspaceIdPageRoute.Link
                    params={{ workspaceId: each.id }}
                    key={each.id}
                    className="relative flex items-start focus:outline-none transition-all focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-foreground gap-2 rounded-lg w-full border border-input p-4 hover:border-ring"
                  >
                    <div className="grid grow gap-2">
                      <div className="flex items-center justify-between">
                        <p>
                          {each.name}{" "}
                          <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                            ({each.isPrivate ? "Private" : "Public"})
                          </span>
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <RelativeDate date={each.createdAt} />
                        </div>
                      </div>
                      <p
                        id="radio-08-r2-description"
                        className="text-xs text-start text-muted-foreground"
                      >
                        {each.description}
                      </p>
                      <button className="flex items-center hover:shadow-sm hover:border-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 transition-all w-fit rounded-full border border-border bg-background p-1">
                        <div className="flex -space-x-3">
                          {pipe(
                            each.members,
                            Array.take(3),
                            Array.map((each) => (
                              <Avatar className="size-4" key={each.id}>
                                <AvatarFallback></AvatarFallback>
                                {each.user.avatar && (
                                  <AvatarImage
                                    src={each.user.avatar}
                                    alt={each.user.name}
                                  />
                                )}
                              </Avatar>
                            )),
                          )}
                        </div>
                        {pipe(
                          each.members,
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
                )),
              )}
            </div>
          </div>
        ),
      })}
    </div>
  );
};

// Dependencies: pnpm install lucide-react
