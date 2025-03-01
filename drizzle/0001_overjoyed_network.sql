CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`createdAt` integer DEFAULT 1740835371782,
	`updatedAt` integer DEFAULT 1740835371782,
	`creatorId` text NOT NULL,
	`isPrivate` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`workspaceId` text NOT NULL,
	`createdAt` integer DEFAULT 1740835371782,
	`updatedAt` integer DEFAULT 1740835371782,
	`permission` text NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_member` ON `members` (`userId`,`workspaceId`);--> statement-breakpoint
CREATE TABLE `notebooks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`kvs` text NOT NULL,
	`createdAt` integer DEFAULT 1740835371782,
	`updatedAt` integer DEFAULT 1740835371782,
	`workspaceId` text NOT NULL,
	`creatorId` text NOT NULL,
	`nodes` text NOT NULL,
	`lastModifiedAt` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creatorId`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`fileName` text NOT NULL,
	`createdAt` integer DEFAULT 1740835371782,
	`updatedAt` integer DEFAULT 1740835371782,
	`notebookId` text NOT NULL,
	`content` text NOT NULL,
	`lastModifiedAt` text NOT NULL,
	FOREIGN KEY (`notebookId`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX IF EXISTS "users_username_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_githubId_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "sessionIndex";--> statement-breakpoint
DROP INDEX IF EXISTS "unique_member";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1740835371782;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_githubId_unique` ON `users` (`githubId`);--> statement-breakpoint
CREATE INDEX `sessionIndex` ON `sessions` (`sessionId`);--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "updatedAt" TO "updatedAt" integer DEFAULT 1740835371782;--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1740835371782;--> statement-breakpoint
ALTER TABLE `sessions` ALTER COLUMN "updatedAt" TO "updatedAt" integer DEFAULT 1740835371782;--> statement-breakpoint
ALTER TABLE `authenticators` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1740835371782;--> statement-breakpoint
ALTER TABLE `authenticators` ALTER COLUMN "updatedAt" TO "updatedAt" integer DEFAULT 1740835371782;--> statement-breakpoint
ALTER TABLE `usersMetadata` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1740835371782;--> statement-breakpoint
ALTER TABLE `usersMetadata` ALTER COLUMN "updatedAt" TO "updatedAt" integer DEFAULT 1740835371782;