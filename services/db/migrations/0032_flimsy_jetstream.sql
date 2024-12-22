ALTER TABLE "variants_table" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "variants_table" ALTER COLUMN "updated_at" SET DEFAULT now();