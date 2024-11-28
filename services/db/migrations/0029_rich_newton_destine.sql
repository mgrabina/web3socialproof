CREATE TABLE IF NOT EXISTS "conversions_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"protocol_id" integer NOT NULL,
	"campaign_id" integer,
	"session" text NOT NULL,
	"user" text NOT NULL,
	"hostname" text,
	"pathname" text,
	"element_id" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "impressions_table" RENAME COLUMN "session_id" TO "session";--> statement-breakpoint
ALTER TABLE "impressions_table" RENAME COLUMN "user_id" TO "user";--> statement-breakpoint
ALTER TABLE "impressions_table" ADD COLUMN "protocol_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversions_table" ADD CONSTRAINT "conversions_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversions_table" ADD CONSTRAINT "conversions_table_campaign_id_campaigns_table_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "impressions_table" ADD CONSTRAINT "impressions_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
