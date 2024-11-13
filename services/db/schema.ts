import {
  boolean,
  integer,
  bigint,
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
  created_at: timestamp("created_at").notNull().defaultNow(),
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

// Campaigns Table with Relation to Protocol Table
export const campaignsTable = pgTable("campaigns_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  name: text("name").notNull(),

  message: text("message"),
  sub_message: text("sub_message"),
  icon: text("icon"),

  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
  enabled: boolean("enabled").notNull(),
  type: text("type").notNull(),
  addresses: text("addresses"),
  styling: json("styling"),
});

// API Key Table with Relation to Protocol Table
export const apiKeyTable = pgTable("api_key_table", {
  api_key: text("key").notNull().unique().primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol
  name: text("name").default("Your API Key"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  enabled: boolean("enabled").notNull().default(true),
});

export const impressionsTable = pgTable("impressions_table", {
  id: serial("id").primaryKey(),
  campaign_id: integer("campaign_id")
    .references(() => campaignsTable.id)
    .notNull(), // Foreign key to campaign
  session: text("session_id").notNull(),
  user: text("user_id").notNull(),
  address: text("address"),
  timestamp: timestamp("created_at").notNull().defaultNow(),
});

export const logsTable = pgTable("logs_table", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocolTable.id), // Foreign key to protocol

  chain_id: integer("chain_id").notNull(),
  contract_address: text("contract_address").notNull(),
  event_name: text("event_name").notNull(),
  topic_index: integer("topic_index"), // 0-3 for 4 topics
  data_key: text("key"),
  data_schema: text("data_schema"),
  start_block: integer("start_block"),

  current_result: bigint({ mode: "bigint" }),
  last_block_indexed: integer("last_block_indexed"),
  calculation_type: text("calculation_type").notNull(),

  enabled: boolean("enabled").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
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
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const metricsVariablesTable = pgTable("metrics_variables_table", {
  id: serial("id").primaryKey(),

  metric_id: integer("metric_id")
    .references(() => metricsTable.id)
    .notNull(), // Foreign key to metrics_table

  variable_id: integer("variable_id")
    .references(() => logsTable.id)
    .notNull(), // Foreign key to variables_table

  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Types
export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertCampaign = typeof campaignsTable.$inferInsert;
export type SelectCampaign = typeof campaignsTable.$inferSelect;
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
