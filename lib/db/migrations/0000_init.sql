CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`business_name` text,
	`category` text,
	`pickup_address` text,
	`instagram` text,
	`tiktok` text,
	`slug` text,
	`national_id` text,
	`plate_number` text,
	`area` text,
	`photo_data_url` text,
	`rider_status` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_slug_unique` ON `users` (`slug`);