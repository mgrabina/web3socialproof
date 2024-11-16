ALTER TABLE "campaigns_table" ADD COLUMN "hostnames" text[];--> statement-breakpoint
ALTER TABLE "campaigns_table" DROP COLUMN IF EXISTS "hosts";