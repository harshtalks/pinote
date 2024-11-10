DROP INDEX IF EXISTS "users_username_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_githubId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "sessionIndex";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1731166627065;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_githubId_unique` ON `users` (`githubId`);--> statement-breakpoint
CREATE INDEX `sessionIndex` ON `sessions` (`sessionId`);--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "updatedAt" TO "updatedAt" integer DEFAULT 1731166627065;--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1731166627065;--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "updatedAt" TO "updatedAt" integer DEFAULT 1731166627065;--> statement-breakpoint
ALTER TABLE `authenticators` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1731166627065;--> statement-breakpoint
ALTER TABLE `authenticators` ALTER COLUMN "updatedAt" TO "updatedAt" integer DEFAULT 1731166627065;