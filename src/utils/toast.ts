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

// Will only work when the handler result ->
export const runAsyncAndNotify = <A, E>(
  handler: () => Promise<Result.Result<A, E>>,
  options?: {
    messages?: {
      loading?: string;
      success?: (value: A) => string;
      error?: string;
    };
    // Callbacks
    onSuccess?: (value: A) => void;
    onError?: (error: E) => void;
    onSettled?: () => void;
    onStart?: () => void;
    onFailure?: (e: unknown) => void;
  },
) =>
  Effect.gen(function* () {
    const notify = yield* Notify;

    // Show loading toast
    yield* notify.createToast("loading")(
      options?.messages?.loading ||
        "Please wait while we process your request...",
    );

    // Callback
    options?.onStart?.();

    // Getting the result
    const output = yield* Effect.promise(handler);

    // Handling the result
    if (Result.isOk(output)) {
      options?.onSuccess?.(output.value);
      yield* notify.createToast("success")(
        options?.messages?.success?.(output.value) ||
          "Request processed successfully",
        true,
      );
    } else {
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
          options?.onFailure?.(e);
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
          options?.onFailure?.(e);
        }),
        Effect.andThen((notify) =>
          notify.createToast("error")(
            options?.messages?.error || getErrorMessage(e),
            true,
          ),
        ),
      ),
    ),
    Effect.ensuring(Effect.succeed(() => options?.onSettled?.())),
    provideNotify,
    clientRuntime.runPromise,
  );

export const runStatefulAsyncAndNotify =
  (setButtonState: (state: ButtonState) => void) =>
  <A, E>(...args: Parameters<typeof runAsyncAndNotify<A, E>>) =>
    runAsyncAndNotify(args[0], {
      ...args[1],
      onError: (error) => {
        setButtonState("error");
        args[1]?.onError?.(error);
      },
      onSuccess: (value) => {
        setButtonState("success");
        args[1]?.onSuccess?.(value);
      },
      onStart: () => {
        setButtonState("pending");
        args[1]?.onStart?.();
      },
      onSettled: () => {
        setButtonState("idle");
        args[1]?.onSettled?.();
      },
      onFailure: (e) => {
        setButtonState("error");
        args[1]?.onFailure?.(e);
      },
    });
