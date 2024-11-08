ALTER TABLE "api_key_table" ALTER COLUMN "protocol_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_key_table" ADD CONSTRAINT "api_key_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns_table" ADD CONSTRAINT "campaigns_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_table" ADD CONSTRAINT "users_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
