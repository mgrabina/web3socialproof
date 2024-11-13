CREATE TABLE IF NOT EXISTS "logs_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"protocol_id" integer,
	"chain_id" integer NOT NULL,
	"contract_address" text NOT NULL,
	"event_name" text NOT NULL,
	"topic_index" integer,
	"key" text,
	"start_block" integer,
	"current_result" bigint,
	"last_block_indexed" integer,
	"calculation_type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events_table" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "variables_table" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "events_table" CASCADE;--> statement-breakpoint
DROP TABLE "variables_table" CASCADE;--> statement-breakpoint
-- ALTER TABLE "metrics_variables_table" DROP CONSTRAINT "metrics_variables_table_variable_id_variables_table_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_table" ADD CONSTRAINT "logs_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "metrics_variables_table" ADD CONSTRAINT "metrics_variables_table_variable_id_logs_table_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."logs_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
