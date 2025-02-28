"use client";

import { useEffect } from "react";
import { MutatorDefs, ReadTransaction, Replicache } from "replicache";

export const useLocalStoreSubscribe = <
  T extends MutatorDefs,
  Data = unknown,
  Deps extends unknown[] = [],
>(
  store: Replicache<T> | null,
  func: (tx: ReadTransaction) => Promise<Data>,
  onData: (data: Data) => void,
  deps: Deps,
) => {
  useEffect(() => {
    if (store) {
      const unsubscribe = store.subscribe(func, {
        onData: onData,
      });

      return () => {
        unsubscribe();
      };
    }
    // eslint-disable-next-line
  }, [store, ...deps]);
};

export const useActionLocalStore = <
  T extends MutatorDefs,
  TReturn = unknown,
  Deps extends unknown[] = [],
>(
  store: Replicache<T> | null,
  func: (store: Replicache<T>) => Promise<TReturn>,
  deps: Deps,
) => {
  useEffect(
    () => {
      if (store) {
        func(store);
      }
    },
    // eslint-disable-next-line
    [store, ...deps],
  );
};
