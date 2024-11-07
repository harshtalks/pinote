CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`githubId` text NOT NULL,
	`createdAt` integer DEFAULT 1730890295838,
	`updatedAt` integer DEFAULT 1730890295838,
	`avatar` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`twoFactorAuth` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_githubId_unique` ON `users` (`githubId`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT 1730890295838,
	`updatedAt` integer DEFAULT 1730890295838,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`details` text,
	`userAgent` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
