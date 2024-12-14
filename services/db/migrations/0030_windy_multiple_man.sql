CREATE TABLE IF NOT EXISTS "experiments_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"protocol_id" integer,
	"name" text NOT NULL,
	"hostnames" text[],
	"pathnames" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "variants_per_experiment_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"experiment_id" integer NOT NULL,
	"variant_id" integer,
	"percentage" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns_table" RENAME TO "variants_table";--> statement-breakpoint
ALTER TABLE "conversions_table" RENAME COLUMN "campaign_id" TO "variant_id";--> statement-breakpoint
ALTER TABLE "impressions_table" RENAME COLUMN "campaign_id" TO "variant_id";--> statement-breakpoint
ALTER TABLE "variants_table" DROP CONSTRAINT "campaigns_table_protocol_id_protocol_table_id_fk";
--> statement-breakpoint
ALTER TABLE "conversions_table" DROP CONSTRAINT "conversions_table_campaign_id_campaigns_table_id_fk";
--> statement-breakpoint
ALTER TABLE "impressions_table" DROP CONSTRAINT "impressions_table_campaign_id_campaigns_table_id_fk";
--> statement-breakpoint
ALTER TABLE "conversions_table" ADD COLUMN "experiment_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "experiments_table" ADD CONSTRAINT "experiments_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variants_per_experiment_table" ADD CONSTRAINT "variants_per_experiment_table_experiment_id_experiments_table_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variants_per_experiment_table" ADD CONSTRAINT "variants_per_experiment_table_variant_id_variants_table_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variants_table" ADD CONSTRAINT "variants_table_protocol_id_protocol_table_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocol_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversions_table" ADD CONSTRAINT "conversions_table_experiment_id_experiments_table_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversions_table" ADD CONSTRAINT "conversions_table_variant_id_variants_table_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "impressions_table" ADD CONSTRAINT "impressions_table_variant_id_variants_table_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "variants_table" DROP COLUMN IF EXISTS "enabled";--> statement-breakpoint
ALTER TABLE "variants_table" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "variants_table" DROP COLUMN IF EXISTS "addresses";--> statement-breakpoint
ALTER TABLE "variants_table" DROP COLUMN IF EXISTS "hostnames";--> statement-breakpoint
ALTER TABLE "variants_table" DROP COLUMN IF EXISTS "pathnames";