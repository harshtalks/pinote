// Branded Types

import { Brand } from "effect";

export type GenerateStringBrand<T extends string> = string & Brand.Brand<T>;

export type UserId = GenerateStringBrand<"UserId">;
export const UserId = Brand.nominal<UserId>();

export type SessionId = GenerateStringBrand<"SessionId">;
export const SessionId = Brand.nominal<SessionId>();

export type AuthentictorId = GenerateStringBrand<"AuthentictorId">;
export const AuthentictorId = Brand.nominal<AuthentictorId>();

export type GithubId = GenerateStringBrand<"GithubId">;
export const GithubId = Brand.nominal<GithubId>();

export type WorkspaceId = GenerateStringBrand<"WorkspaceId">;
export const WorkspaceId = Brand.nominal<WorkspaceId>();

export type LastModified = GenerateStringBrand<"LastModified">;
export const LastModified = Brand.nominal<LastModified>();

export type NotebookId = GenerateStringBrand<"NotebookId">;
export const NotebookId = Brand.nominal<NotebookId>();

export type ReplicacheClientGroupId =
  GenerateStringBrand<"ReplicacheClientGroupId">;
export const ReplicacheClientGroupId = Brand.nominal<ReplicacheClientGroupId>();

export type ReplicacheClientId = GenerateStringBrand<"ReplicacheClientId">;
export const ReplicacheClientId = Brand.nominal<ReplicacheClientId>();
