CREATE TABLE IF NOT EXISTS "metrics_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"protocol_id" integer,
	"name" text NOT NULL,
	"description" text,
	"calculation_type" text NOT NULL,
	"last_value" integer,
	"last_calculated" timestamp,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metrics_variables_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_id" integer NOT NULL,
	"variable_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "variables_table" ADD COLUMN "protocol_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "metrics_table" ADD CONSTRAINT "metrics_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "metrics_variables_table" ADD CONSTRAINT "metrics_variables_table_metric_id_metrics_table_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."metrics_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "metrics_variables_table" ADD CONSTRAINT "metrics_variables_table_variable_id_variables_table_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variables_table" ADD CONSTRAINT "variables_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "variables_table" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "variables_table" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "variables_table" DROP COLUMN IF EXISTS "calculation_type";