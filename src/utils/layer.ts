import { Layer, ManagedRuntime } from "effect";

export const clientRuntime = ManagedRuntime.make(Layer.empty);
