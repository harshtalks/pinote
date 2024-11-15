// Result type for the trpc responses

import { Effect } from "effect";
import { getErrorMessage, UncaughtError } from "./errors";

export type Ok<A> = {
  __tag__: "Ok";
  value: A;
};

export type Err<E> = {
  __tag__: "Err";
  error: E;
};

export const ok = <A>(value: A): Ok<A> => ({ __tag__: "Ok", value });
export const err = <E>(error: E): Err<E> => ({ __tag__: "Err", error });

export const flatten = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.flatMap(self, (v) => Effect.succeed(ok(v)));

export const catchAll = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.catchAll(self, (e) => Effect.succeed(err(e)));

export const catchAllDefect = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.catchAllDefect(self, (e) =>
    Effect.succeed(err(new UncaughtError({ message: getErrorMessage(e) }))),
  );

export const succeedWithErr = <E>(error: E): Effect.Effect<Err<E>> =>
  Effect.succeed(err(error));
export const succeedWithOk = <A>(value: A): Effect.Effect<Ok<A>> =>
  Effect.succeed(ok(value));

export const getOk = <A>(result: Ok<A>) => Effect.succeed(result.value);
export const getErr = <E>(result: Err<E>) => Effect.succeed(result.error);

export const isOk = <A>(result: Ok<A> | Err<unknown>): result is Ok<A> =>
  result.__tag__ === "Ok";
export const isErr = <E>(result: Ok<unknown> | Err<E>): result is Err<E> =>
  result.__tag__ === "Err";

export const match = <A, E, OkResult, ErrResult>({
  onOk,
  onErr,
}: {
  onOk: (value: A) => OkResult;
  onErr: (error: E) => ErrResult;
}) => {
  return (result: Ok<A> | Err<E>): OkResult | ErrResult =>
    isOk(result) ? onOk(result.value) : onErr(result.error);
};

export type Result<A, E> = Ok<A> | Err<E>;
