"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { MutatorDefs, Replicache, ReplicacheOptions } from "replicache";
import { pipe } from "effect";
import { Branded } from "@/types/*";
import { StoreKey, storeKeys } from "./store.keys";
import env from "../../env";
import { If } from "@/wrappers/if";

const localFirstStoreCreator = <T extends MutatorDefs>(
  options: Omit<ReplicacheOptions<T>, "name" | "licenseKey"> & {
    key: StoreKey;
  },
) => {
  type Store = Replicache<T> | null;
  const { key, ...rest } = options;

  const storeContext = createContext<Store>(null);

  const Provider = ({
    children,
    userId,
  }: {
    children: ReactNode;
    userId: Branded.UserId;
  }) => {
    const [store, setStore] = useState<Store>(null);
    const setStoreAndReturn = (store: Replicache<T>) => {
      setStore(store);
      return store;
    };

    useEffect(() => {
      pipe(
        new Replicache({
          ...rest,
          name: storeKeys[key](userId),
          licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
        }),
        setStoreAndReturn,
        // cleaning up
        (rep) => () => rep.close(),
      );
    }, [userId]);

    return (
      <storeContext.Provider value={store}>
        <If value={store} condition={(store) => !!store?.name}>
          {() => children}
        </If>
      </storeContext.Provider>
    );
  };

  const useLocalFirst = () => {
    const ctx = useContext(storeContext);

    if (!ctx) {
      throw new Error(
        "useLocalFirst must be used within a <LocalFirstProvider/>",
      );
    }

    return ctx;
  };

  return {
    Provider,
    useLocalFirst,
    storeContext,
  };
};

export default localFirstStoreCreator;
