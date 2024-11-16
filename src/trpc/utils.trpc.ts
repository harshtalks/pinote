// sometimes we want to cast an input to a specific type

import { getErrorMessage, UncaughtError } from "@/utils/errors";
import { TRPCError } from "@trpc/server";
import { Effect, Either, Schema } from "effect";

// Cast an input to a specific type
export const inputAs =
  <T>() =>
  (input: unknown) =>
    input as T;

// We will not be using zod anymore, this function reduces the boilerplate for adding effect schemas to input.
export const inputAsSchema = <A, I>(schema: Schema.Schema<A, I>) =>
  Schema.decodeUnknownSync(schema);

// All the trpc responses will be wrapped in an Either.
export const asEither = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.flatMap(self, (v) => Effect.succeed(Either.right(v))).pipe(
    Effect.catchAll((e) => Effect.succeed(Either.left(e))),
    Effect.catchAllDefect((e) =>
      Effect.succeed(
        Either.left(
          new UncaughtError({
            message: getErrorMessage(e),
          }),
        ),
      ),
    ),
  );

export const failwithTrpcErr = (trpcErr: TRPCError) => Effect.fail(trpcErr);
