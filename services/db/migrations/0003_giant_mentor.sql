ALTER TABLE "protocol_table" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "protocol_table" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "protocol_table" ALTER COLUMN "plan" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "protocol_table" ALTER COLUMN "stripe_id" DROP NOT NULL;