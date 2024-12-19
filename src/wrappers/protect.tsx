import { Role } from "@/db/schema/schema.enums";
import { Either } from "effect";

export type IssuedObjectBase = {
  email: string;
  id: string;
};

export type ProtectProps<T extends IssuedObjectBase> = {
  children: React.ReactNode;
  role: Role;
  against:
    | {
        authedUser: true;
      }
    | {
        authedUser: false;
        object: T;
      };
};

// TODO update
declare function checkRole<T extends IssuedObjectBase>(
  role: Role,
  against: ProtectProps<T>["against"],
): Either.Either<true>;

export const Protect = <T extends IssuedObjectBase>({
  children,
  against,
  role,
}: ProtectProps<T>) => {
  const hasAccess = checkRole(role, against);

  return hasAccess.pipe(
    Either.match({
      onRight: () => children,
      onLeft: () => null,
    }),
  );
};
