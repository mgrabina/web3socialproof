ALTER TABLE "conversions_table" ALTER COLUMN "protocol_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "impressions_table" ALTER COLUMN "variant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "impressions_table" ADD COLUMN "experiment_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "impressions_table" ADD CONSTRAINT "impressions_table_experiment_id_experiments_table_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
