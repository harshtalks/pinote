"use client";
import { ResetUser } from "./reset-user";
import { useState } from "react";
import { api } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { runAsyncAndNotify, runStatefulAsyncAndNotify } from "@/utils/toast";
import { AnimatedButton, useAnimatedButton } from "../global/buttons/*";

export const Recover = () => {
  const [token, setToken] = useState("");
  const router = useRouter();
  const recover = api.twoFactor.recoverAccount.useMutation();
  const { buttonState, changeButtonState } = useAnimatedButton();

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runStatefulAsyncAndNotify(changeButtonState)(
            () => recover.mutateAsync({ recoveryCode: token }),
            {
              onSuccess: () => router.refresh(),
            },
          );
        }}
        className="space-y-4"
      >
        <div className="relative rounded-lg border border-input bg-background shadow-sm shadow-black/5 ring-offset-background transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 focus-within:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 [&:has(input:is(:disabled))_*]:pointer-events-none">
          <label
            htmlFor="input-33"
            className="block px-3 pt-2 text-xs font-medium text-foreground"
          >
            Recover your account
          </label>
          <input
            id="input-33"
            className="flex h-10 w-full bg-transparent px-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
            placeholder="Recovery Code"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <AnimatedButton
          size="sm"
          buttonState={buttonState}
          type="submit"
          disabled={!token}
          className="tracking-normal w-full font-cal"
          labels={{
            idle: "Recover Account",
            error: "Failed to recover",
            success: "Account recovered",
          }}
        />
      </form>
      <div>
        <p className="text-muted-foreground leading-relaxed text-xs">
          In case you have lost your recovery code, you can reset your account
          and start over.
        </p>
        <ResetUser />
      </div>
    </div>
  );
};
