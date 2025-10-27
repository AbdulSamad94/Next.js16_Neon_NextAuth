CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100),
	"email" varchar(100) NOT NULL,
	"image" text,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(100),
	"role" "role" DEFAULT 'user' NOT NULL,
	"bio" text DEFAULT 'Hey there! I''m new on BlogHub' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
