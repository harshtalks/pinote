// Branded Types

import { Brand } from "effect";

export type UserId = string & Brand.Brand<"UserId">;
export const UserId = Brand.nominal<UserId>();

export type SessionId = string & Brand.Brand<"SessionId">;
export const SessionId = Brand.nominal<SessionId>();

export type AuthentictorId = string & Brand.Brand<"AuthentictorId">;
export const AuthentictorId = Brand.nominal<AuthentictorId>();

export type GithubId = string & Brand.Brand<"GithubId">;
export const GithubId = Brand.nominal<GithubId>();

export type WorkspaceId = string & Brand.Brand<"WorkspaceId">;
export const WorkspaceId = Brand.nominal<WorkspaceId>();
