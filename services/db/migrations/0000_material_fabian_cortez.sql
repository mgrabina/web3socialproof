-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE IF NOT EXISTS "users_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"plan" text NOT NULL,
	"stripe_id" text NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);
