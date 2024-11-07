ALTER TABLE "api_key_table" ALTER COLUMN "name" SET DEFAULT 'Your API Key';--> statement-breakpoint
ALTER TABLE "api_key_table" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "api_key_table" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "api_key_table" ALTER COLUMN "enabled" SET DEFAULT true;