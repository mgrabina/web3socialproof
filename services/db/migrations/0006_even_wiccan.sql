CREATE TABLE IF NOT EXISTS "impressions_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer,
	"session_id" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "impressions_table" ADD CONSTRAINT "impressions_table_campaign_id_campaigns_table_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
