CREATE TABLE IF NOT EXISTS "contracts_table" (
	"chain_id" integer NOT NULL,
	"contract_address" text NOT NULL,
	"contract_name" text,
	"contract_abi" json,
	"ownership_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
