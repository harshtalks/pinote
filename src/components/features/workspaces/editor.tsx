"use client";
import { TitleInput } from "../notebooks/title";
import { KeyValue, keyvalues } from "../notebooks/kv";
import Notebook from "../notebooks/notebook";

export const Editor = () => {
  return (
    <section className="flex overflow-y-auto flex-col">
      <div className="w-[700px] flex-col gap-12 mx-auto flex text-neutral-700">
        <div className="space-y-8">
          <TitleInput />
          <KeyValue keyvalues={keyvalues} />
        </div>
        <Notebook />
      </div>
    </section>
  );
};
