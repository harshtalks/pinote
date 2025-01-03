"use client";

import { useEffect } from "react";

export const useOnceEffect = (effect: React.EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, []);
};
