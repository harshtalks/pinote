import { Settings } from "@/components/features/workspaces/settings";
import { ReactNode } from "react";

const WorkspacesLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      {children}
      <Settings />
    </div>
  );
};

export default WorkspacesLayout;
