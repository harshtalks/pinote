"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { toast } from "sonner";

export const SkipStatus = () => {
  const mutation = api.twoFactor.tfSkip.useMutation();
  return (
    <Button
      size="sm"
      onClick={() =>
        toast.promise(
          mutation.mutateAsync({
            skip: true,
          }),
          {
            loading: "Wait while we request your process...",
            success: () => "You have successfully skipped the process",
            error: (err) => err.message,
          },
        )
      }
      className="text-xs p-0"
      variant="link"
    >
      Skip for now
    </Button>
  );
};
