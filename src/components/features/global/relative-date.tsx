import { Match, pipe } from "effect";
import { DateTime } from "luxon";

export const RelativeDate = ({ date }: { date: number | undefined | null }) => {
  return Match.value(date).pipe(
    Match.when(
      (date): date is number => !!date,
      (date) =>
        pipe(
          date,
          DateTime.fromMillis,
          (d) => d.toRelative(),
          (d) => <p>{d}</p>,
        ),
    ),
    Match.orElse(() => null),
  );
};
