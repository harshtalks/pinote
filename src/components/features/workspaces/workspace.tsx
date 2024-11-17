import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/server";
import { Plus } from "lucide-react";

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
      <Button
        variant="ghost"
        className="h-full flex items-center select-none gap-2"
      >
        <span className="p-4 bg-zinc-100 rounded-md">
          <Plus className="size-6" />
        </span>
        <p className="font-light text-lg">Create New Workspace </p>
      </Button>
    </div>
  );
};
