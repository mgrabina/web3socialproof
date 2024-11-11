import {
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
