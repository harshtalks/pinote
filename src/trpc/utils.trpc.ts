// sometimes we want to cast an input to a specific type

import { Effect, Either } from "effect";

export const inputAs =
  <T>() =>
  (input: unknown) =>
    input as T;

export const asEither = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.flatMap(self, (v) => Effect.succeed(Either.right(v))).pipe(
    Effect.catchAll((e) => Effect.succeed(Either.left(e))),
  );
