
CREATE TABLE IF NOT EXISTS "campaigns_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"enabled" boolean NOT NULL,
	"type" text NOT NULL,
	"addresses" text NOT NULL
);


CREATE TABLE IF NOT EXISTS "api_key_table" (
	"key" text PRIMARY KEY NOT NULL,
	"protocol_id" integer NOT NULL,
	"name" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"enabled" boolean NOT NULL,
	CONSTRAINT "api_key_table_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "protocol_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"plan" text NOT NULL,
	"stripe_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns_table" RENAME COLUMN "user_id" TO "protocol_id";--> statement-breakpoint
ALTER TABLE "campaigns_table" ALTER COLUMN "addresses" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns_table" ADD COLUMN "styling" json;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "protocol_id" integer;--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN IF EXISTS "plan";--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN IF EXISTS "stripe_id";