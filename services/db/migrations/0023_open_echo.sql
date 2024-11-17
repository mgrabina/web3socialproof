CREATE TABLE IF NOT EXISTS "verification_codes_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"protocol_id" integer,
	"code" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"expiration" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification_codes_table" ADD CONSTRAINT "verification_codes_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
