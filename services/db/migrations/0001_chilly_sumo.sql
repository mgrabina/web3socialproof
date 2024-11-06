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
