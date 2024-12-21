import {
  bigint,
  boolean,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Protocol Table
export const protocolTable = pgTable("protocol_table", {
  id: serial("id").primaryKey(),
  name: text("name"),
  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  plan: text("plan"),
  stripe_id: text("stripe_id"),
});

// Users Table with Relation to Protocol Table
export const usersTable = pgTable("users_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
});

// Variants Table with Relation to Protocol Table
export const variantsTable = pgTable("variants_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  name: text("name").notNull(),

  message: text("message").notNull(),
  sub_message: text("sub_message").notNull(),
  iconSrc: text("iconSrc"),
  iconName: text("iconName"),
  delay: integer("delay"),
  timer: integer("timer"),
  styling: json("styling"),

  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const experimentsTable = pgTable("experiments_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  name: text("name").notNull(),

  hostnames: text("hostnames").array(),
  pathnames: text("pathnames").array(),

  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  enabled: boolean("enabled").notNull().default(true),
});

export const variantsPerExperimentTable = pgTable(
  "variants_per_experiment_table",
  {
    id: serial("id").primaryKey(),
    experiment_id: integer("experiment_id")
      .references(() => experimentsTable.id)
      .notNull(), // Foreign key to experiment
    variant_id: integer("variant_id").references(() => variantsTable.id),
    percentage: integer("percentage").notNull(),
  }
);

// API Key Table with Relation to Protocol Table
export const apiKeyTable = pgTable("api_key_table", {
  key: text("key").notNull().unique().primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  name: text("name").default("Your API Key"),
  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  enabled: boolean("enabled").notNull().default(true),
});

export const impressionsTable = pgTable("impressions_table", {
  id: serial("id").primaryKey(),
  protocol: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  variant_id: integer("variant_id").references(() => variantsTable.id),
  experiment_id: integer("experiment_id")
    .references(() => experimentsTable.id),
  session: text("session").notNull(),
  user: text("user").notNull(),
  address: text("address"),
  timestamp: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const conversionsTable = pgTable("conversions_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id")
    .references(() => protocolTable.id), // Foreign key to protocol
  experiment_id: integer("experiment_id")
    .references(() => experimentsTable.id),
  variant_id: integer("variant_id").references(() => variantsTable.id),
  session: text("session").notNull(),
  user: text("user").notNull(),
  hostname: text("hostname"),
  pathname: text("pathname"),
  element_id: text("element_id"),
  timestamp: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const logsTable = pgTable("logs_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol

  chain_id: integer("chain_id").notNull(),
  contract_address: text("contract_address").notNull(),
  event_name: text("event_name").notNull(),
  topic_index: integer("topic_index"), // 0-3 for 4 topics
  key: text("key"),
  data_schema: text("data_schema"),
  start_block: integer("start_block"),

  current_result: bigint({ mode: "bigint" }),
  last_block_indexed: integer("last_block_indexed"),
  calculation_type: text("calculation_type").notNull(),

  enabled: boolean("enabled").notNull().default(true),
  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const metricsTable = pgTable("metrics_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol

  name: text("name").notNull(),
  description: text("description"),

  calculation_type: text("calculation_type").notNull(),

  last_value: integer("last_value"),
  last_calculated: timestamp("last_calculated"),

  enabled: boolean("enabled").notNull().default(true),
  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const metricsVariablesTable = pgTable("metrics_variables_table", {
  id: serial("id").primaryKey(),

  metric_id: integer("metric_id")
    .references(() => metricsTable.id)
    .notNull(), // Foreign key to metrics_table

  variable_id: integer("variable_id")
    .references(() => logsTable.id)
    .notNull(), // Foreign key to variables_table

  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const contractsTable = pgTable("contracts_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  chain_id: integer("chain_id").notNull(),
  contract_address: text("contract_address").notNull(),
  contract_name: text("contract_name"),
  contract_abi: json("contract_abi"),
  ownership_verified: boolean("ownership_verified").notNull().default(false),
  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const verificationCodesTable = pgTable("verification_codes_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  chain_id: integer("chain_id").notNull(),
  contract_address: text("contract_address").notNull(),
  code: text("code").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  expiration: timestamp({ mode: "string" }).notNull(),
  created_at: timestamp({ mode: "string" }).notNull().defaultNow(),
});

// Types
export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertVariant = typeof variantsTable.$inferInsert;
export type SelectVariant = typeof variantsTable.$inferSelect;
export type InsertExperiment = typeof experimentsTable.$inferInsert;
export type SelectExperiment = typeof experimentsTable.$inferSelect;
export type InsertVariantPerExperiment =
  typeof variantsPerExperimentTable.$inferInsert;
export type SelectVariantPerExperiment =
  typeof variantsPerExperimentTable.$inferSelect;
export type InsertConversion = typeof conversionsTable.$inferInsert;
export type SelectConversion = typeof conversionsTable.$inferSelect;
export type InsertApiKey = typeof apiKeyTable.$inferInsert;
export type SelectApiKey = typeof apiKeyTable.$inferSelect;
export type InsertImpression = typeof impressionsTable.$inferInsert;
export type SelectImpression = typeof impressionsTable.$inferSelect;
export type SelectProtocol = typeof protocolTable.$inferSelect;
export type InsertProtocol = typeof protocolTable.$inferInsert;
export type InsertLog = typeof logsTable.$inferInsert;
export type SelectLog = typeof logsTable.$inferSelect;
export type InsertMetric = typeof metricsTable.$inferInsert;
export type SelectMetric = typeof metricsTable.$inferSelect;
export type InsertMetricsVariable = typeof metricsVariablesTable.$inferInsert;
export type SelectMetricsVariable = typeof metricsVariablesTable.$inferSelect;
export type InsertContract = typeof contractsTable.$inferInsert;
export type SelectContract = typeof contractsTable.$inferSelect;
export type InsertVerificationCode = typeof verificationCodesTable.$inferInsert;
export type SelectVerificationCode = typeof verificationCodesTable.$inferSelect;
