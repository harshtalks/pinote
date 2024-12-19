export const permissions = ["read", "write"] as const;
export const roles = ["admin", "user"] as const;

export type Role = (typeof roles)[number];
export type Permission = (typeof permissions)[number];
