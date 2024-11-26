"use client";
import { TitleInput } from "../notebooks/title";
import { KeyValue, keyvalues } from "../notebooks/kv";

export const Editor = () => {
  return (
    <section>
      <div className="w-[700px] mx-auto flex text-neutral-700">
        <div className="space-y-8">
          <TitleInput />
          <KeyValue keyvalues={keyvalues} />
        </div>
      </div>
    </section>
  );
};
