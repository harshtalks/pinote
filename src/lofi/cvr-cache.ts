import { cvr } from "@/types/*";
import { Cache, Duration, Effect, Ref } from "effect";

const localRef = Ref.make<Record<string, cvr.ClientViewRecord>>({});

const lookupFn = (key: string) =>
  localRef.pipe(
    Effect.andThen(Ref.get),
    Effect.andThen((value) => value[key] ?? undefined),
  );

export class CvrCache extends Effect.Service<CvrCache>()("local-store/cvr", {
  effect: Cache.make<string, cvr.ClientViewRecord | undefined>({
    capacity: 100,
    timeToLive: Duration.infinity,
    lookup: lookupFn,
  }),
}) {}

export const makeCvrKey = (groupClientId: string, orderNumber: string) =>
  [groupClientId, orderNumber].join("/");
