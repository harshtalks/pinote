import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/server";
import { Folder, GridIcon, PanelLeft, PlusIcon, Settings } from "lucide-react";
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import NotebookTabs from "@/components/features/notebooks/tabs";

const Layout = async ({ children }: { children: ReactNode }) => {
  const me = await api.user.me();

  return (
    <main className="bg-zinc-100 flex-col flex min-h-screen py-4 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button>
            <PanelLeft />
          </button>
          {/* Tabs  */}
          <NotebookTabs />
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="input-25"
                className="pe-11 shadow-none min-w-[300px]"
                placeholder="Search..."
                type="search"
              />
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
                <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
          <Avatar className="size-8">
            <AvatarFallback className="bg-red-50">
              {me.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
            {me.avatar ? <AvatarImage src={me.avatar} /> : null}
          </Avatar>
        </div>
      </div>
      {/* Actual Content */}

      <div className="flex gap-1 flex-1 h-full">
        <div className="bg-background border rounded-lg p-4 space-y-8">
          <Folder size={16} />
          <Settings size={16} />
        </div>
        <div className="bg-background flex-1 pt-24 border rounded-xl">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;
