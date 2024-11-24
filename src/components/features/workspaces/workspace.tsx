import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/server";
import { AddNewWorkspace } from "./add-new-workspace";

export const Workspace = async () => {
  const user = await api.user.me();

  return (
    <div className="max-w-3xl space-y-12 py-24 mx-auto">
      <div className="space-y-4">
        <Avatar className="size-24">
          <AvatarFallback>{user.name[0]}</AvatarFallback>
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        </Avatar>
        <div>
          <h1 className="text-5xl font-cal">Hello, {user.name}!</h1>
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-cal">Create your first workspace</h2>
        <p>You can invite people on to your workspaces with the link shared.</p>
      </div>
      <AddNewWorkspace />
    </div>
  );
};
