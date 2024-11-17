// Make a ref to manage toast through out the application.

import { Effect, Ref } from "effect";
import { ReactNode } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "./errors";
import { clientRuntime } from "./layer";
import { Result } from "./*";
import { ButtonState } from "@/components/features/global/buttons/*";

const toastVariants = {
  error: toast.error,
  info: toast.info,
  loading: toast.loading,
  success: toast.success,
  warning: toast.warning,
};

export type ToastVariant = keyof typeof toastVariants;

export class Notify extends Effect.Service<Notify>()("Client/Notify", {
  effect: Ref.make<string | number>(Infinity),
}) {
  createToast =
    <T extends ToastVariant>(variant: T) =>
    (message: string | ReactNode, remove?: boolean) => {
      return Effect.gen(function* () {
        const notify = yield* Notify;
        const toastId = yield* Ref.get(notify);

        if (toastId !== Infinity) {
          toastVariants[variant](message, {
            id: toastId,
          });
        } else {
          const newToastId = toastVariants[variant](message);
          yield* Ref.set(notify, newToastId);

          if (remove) {
            yield* Ref.set(notify, Infinity);
          }
        }
      });
    };

  dismissToast = () =>
    Effect.gen(function* () {
      const notify = yield* Notify;
      const toastId = yield* Ref.get(notify);
      if (toastId !== Infinity) {
        toast.dismiss(toastId);
      }
      yield* Ref.set(notify, Infinity);
    });
}

export const provideNotify = <A, E, R>(
  self: Effect.Effect<A, E, R | Notify>,
): Effect.Effect<A, E, Exclude<R, Notify>> =>
  self.pipe(Effect.provide(Notify.Default));

// Will only work when the handler result
export const runAsyncAndNotify = <A, E>(
  handler: () => Promise<Result.Result<A, E>>,
  options?: {
    messages?: {
      loading?: string;
      success?: (value: A) => string;
      error?: string;
    };
    setButtonState?: (state: ButtonState) => void;
    onSuccess?: (value: A) => void;
    onError?: (error: E) => void;
    onSettled?: () => void;
  },
) =>
  Effect.gen(function* () {
    const notify = yield* Notify;

    // Show loading toast
    yield* notify.createToast("loading")(
      options?.messages?.error ||
        "Please wait while we process your request...",
    );
    options?.setButtonState?.("pending");

    const output = yield* Effect.promise(handler);

    if (Result.isOk(output)) {
      options?.setButtonState?.("success");
      options?.onSuccess?.(output.value);
      yield* notify.createToast("success")(
        options?.messages?.success?.(output.value) ||
          "Request processed successfully",
        true,
      );
    } else {
      options?.setButtonState?.("error");
      options?.onError?.(output.error);
      yield* notify.createToast("error")(
        options?.messages?.error || getErrorMessage(output.error),
        true,
      );
    }
  }).pipe(
    Effect.catchAll((e) =>
      Notify.pipe(
        Effect.tap(() => {
          options?.setButtonState?.("error");
          options?.onError?.(e);
        }),
        Effect.andThen((notify) =>
          notify.createToast("error")(
            options?.messages?.error || getErrorMessage(e),
            true,
          ),
        ),
      ),
    ),
    Effect.catchAllDefect((e) =>
      Notify.pipe(
        Effect.tap(() => {
          options?.setButtonState?.("error");
          options?.onError?.(e);
        }),
        Effect.andThen((notify) =>
          notify.createToast("error")(
            options?.messages?.error || getErrorMessage(e),
            true,
          ),
        ),
      ),
    ),
    provideNotify,
    clientRuntime.runPromise,
  );
