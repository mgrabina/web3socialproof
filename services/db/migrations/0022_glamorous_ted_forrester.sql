ALTER TABLE "contracts_table" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts_table" ADD COLUMN "protocol_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts_table" ADD CONSTRAINT "contracts_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
