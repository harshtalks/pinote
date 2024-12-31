import { Effect } from "effect";
import { getErrorMessage, UncaughtError } from "./errors";

// Result type for the trpc responses
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

export const mapOk = <A, E, B>(
  result: Result<A, E>,
  fn: (value: A) => B,
): Result<B, E> => (isOk(result) ? ok(fn(result.value)) : result);
export const mapErr = <A, E, F>(
  result: Result<A, E>,
  fn: (error: E) => F,
): Result<A, F> => (isErr(result) ? err(fn(result.error)) : result);
export const map = <A, E, B, F>(
  result: Result<A, E>,
  { onOk, onErr }: { onOk: (value: A) => B; onErr: (error: E) => F },
): Result<B, F> =>
  isOk(result) ? ok(onOk(result.value)) : err(onErr(result.error));

export const isOk = <A>(result: Ok<A> | Err<unknown>): result is Ok<A> =>
  result.__tag__ === "Ok";
export const isErr = <E>(result: Ok<unknown> | Err<E>): result is Err<E> =>
  result.__tag__ === "Err";

export const match = <A, E, OkResult, ErrResult>(
  result: Result<A, E>,
  {
    onOk,
    onErr,
  }: {
    onOk: (value: A) => OkResult;
    onErr: (error: E) => ErrResult;
  },
): OkResult | ErrResult => {
  return isOk(result) ? onOk(result.value) : onErr(result.error);
};

export type Result<A, E> = Ok<A> | Err<E>;
