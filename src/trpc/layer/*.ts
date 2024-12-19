import { ManagedRuntime } from "effect";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: {
    serviceName: "pinote-trpc",
  },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

export const trpcRunTime = ManagedRuntime.make(NodeSdkLive);
