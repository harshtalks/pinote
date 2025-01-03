import { Match } from "effect";
import { ReactNode } from "react";

export type IfProps<T> = {
  value: T;
  condition: (value: T) => boolean;
  children: (
    value: Match.Types.WhenMatch<T, (value: T) => boolean>,
  ) => ReactNode;
};

export type IfElseProps<T> = IfProps<T> & { orElse: () => ReactNode };

export const If = <T,>({ value, condition, children }: IfProps<T>) =>
  Match.value(value).pipe(
    Match.when(condition, children),
    Match.orElse(() => null),
  );

export const IfElse = <T,>({
  value,
  condition,
  children,
  orElse,
}: IfElseProps<T>) =>
  Match.value(value).pipe(
    Match.when(condition, children),
    Match.orElse(orElse),
  );
