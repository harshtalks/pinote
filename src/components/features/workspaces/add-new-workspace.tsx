"use client";

import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Match } from "effect";
import { AddNewWorkspaceForm } from "./add-new-workspacce-form";

export const AddNewWorkspace = () => {
  const [showForm, setShowForm] = useState(false);

  const openForm = () => setShowForm(true);
  const closeForm = () => {
    setShowForm(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={openForm}
        className="h-full flex items-center select-none gap-2"
      >
        <span className="p-4 bg-zinc-100 rounded-md">
          <Plus className="size-6" />
        </span>
        <p className="font-light text-lg">Create New Workspace </p>
      </Button>
      <AnimatePresence mode="wait">
        {Match.value(showForm).pipe(
          Match.when(true, () => (
            <motion.div
              initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AddNewWorkspaceForm onCancel={closeForm} />
            </motion.div>
          )),
          Match.orElse(() => null),
        )}
      </AnimatePresence>
    </>
  );
};
