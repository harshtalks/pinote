import { provideDefault } from "@/utils/*";
import Dockerode from "dockerode";
import { Effect } from "effect";

// Docker Service
export class Docker extends Effect.Service<Docker>()("Docker", {
  effect: Effect.sync(
    () =>
      new Dockerode({
        // TODO - make this configurable
        socketPath: "/var/run/docker.sock",
      }),
  ),
}) {}

// Provide default Docker service
export const provideDefaultDocker = provideDefault(Docker.Default);
