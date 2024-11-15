// Make a ref to manage toast through out the application.

import { Effect, Ref } from "effect";
import { ReactNode } from "react";
import { toast } from "sonner";

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

  updateToast =
    <T extends ToastVariant>(variant: T) =>
    (message: string | ReactNode, remove?: boolean) => {
      return Effect.gen(function* () {
        const notify = yield* Notify;
        const toastId = yield* Ref.get(notify);

        if (toastId !== Infinity) {
          toastVariants[variant](message, {
            id: toastId,
          });
        }

        if (remove) {
          yield* Ref.set(notify, Infinity);
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
