// sometimes we want to cast an input to a specific type

export const inputAs =
  <T>() =>
  (input: unknown) =>
    input as T;
