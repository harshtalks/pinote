"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { runAsyncAndNotify } from "@/utils/toast";
import { useRouter } from "next/navigation";

export const SkipStatus = () => {
  const router = useRouter();
  const mutation = api.twoFactor.tfSkip.useMutation({});

  return (
    <Button
      size="sm"
      onClick={() =>
        runAsyncAndNotify(
          () =>
            mutation.mutateAsync({
              skip: true,
            }),
          {
            messages: {
              success: () => "Two-factor authentication has been skipped",
            },
            onSuccess: () => {
              router.refresh();
            },
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
