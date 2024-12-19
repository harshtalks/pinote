"use client";

import { clientRuntime, Notify, provideNotify } from "@/utils/*";
import { Effect } from "effect";
import { useEffect, useState } from "react";

export const useIsCopied = (duration = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) =>
    Effect.gen(function* () {
      const notify = yield* Notify;
      yield* Effect.promise(() => navigator.clipboard.writeText(text));
      yield* notify.createToast("success")("Copied to clipboard", true);
      setIsCopied(true);
    }).pipe(
      Effect.catchAllCause(() =>
        Notify.pipe(
          Effect.andThen((notify) =>
            notify.createToast("error")("Failed to copy to clipboard", true),
          ),
        ),
      ),
      provideNotify,
      clientRuntime.runPromise,
    );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, duration);

    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied]);

  return { isCopied, copyToClipboard };
};
