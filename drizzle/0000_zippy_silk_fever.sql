CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`githubId` text NOT NULL,
	`createdAt` integer DEFAULT 1731745930578,
	`updatedAt` integer DEFAULT 1731745930578,
	`avatar` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`twoFactorAuth` integer DEFAULT false NOT NULL,
	`skippedTfStep` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_githubId_unique` ON `users` (`githubId`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT 1731745930578,
	`updatedAt` integer DEFAULT 1731745930578,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`details` text,
	`userAgent` text,
	`sessionId` text NOT NULL,
	`tfVerified` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessionIndex` ON `sessions` (`sessionId`);--> statement-breakpoint
CREATE TABLE `authenticators` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer DEFAULT 1731745930578,
	`updatedAt` integer DEFAULT 1731745930578,
	`credentialPublicKey` text NOT NULL,
	`algorithm` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `usersMetadata` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT 1731745930578,
	`updatedAt` integer DEFAULT 1731745930578,
	`userId` text NOT NULL,
	`recoveryCode` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
