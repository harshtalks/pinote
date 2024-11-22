import { Effect, Layer } from "effect";

export const provideDefault =
  <S>(service: Layer.Layer<S>) =>
  <A, E, R>(
    self: Effect.Effect<A, E, R | S>,
  ): Effect.Effect<A, E, Exclude<R, S>> =>
    Effect.provide(self, service);
