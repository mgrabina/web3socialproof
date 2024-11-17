ALTER TABLE "verification_codes_table" ADD COLUMN "chain_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_codes_table" ADD COLUMN "contract_address" text NOT NULL;