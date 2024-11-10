import { Hero } from "@/components/features/home/*";
import { api } from "@/trpc/server.trpc";
import { Either } from "effect";

export default async function Home() {
  const x = await api.hello({ name: 1 });
  return (
    <main>
      <Hero />
      {Either.match(x, {
        onLeft: (a) => <div>{a.message}</div>,
        onRight: (b) => <div>{b}</div>,
      })}
    </main>
  );
}
