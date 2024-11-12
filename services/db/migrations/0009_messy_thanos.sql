CREATE TABLE IF NOT EXISTS "events_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"variable_id" integer,
	"chain_id" integer NOT NULL,
	"transaction_hash" text NOT NULL,
	"block_number" integer NOT NULL,
	"timestamp" timestamp NOT NULL,
	"value" integer NOT NULL,
	"data" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "variables_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"chain_id" integer NOT NULL,
	"contract_address" text NOT NULL,
	"event_name" text NOT NULL,
	"topic_index" integer,
	"key" text,
	"start_block" integer,
	"calculation_type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_table" ADD CONSTRAINT "events_table_variable_id_variables_table_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
