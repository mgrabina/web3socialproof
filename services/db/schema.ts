import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  plan: text("plan").notNull(),
  stripe_id: text("stripe_id").notNull(),
});

export const campaignsTable = pgTable("campaigns_table", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  name: text("name").notNull(),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
  enabled: boolean("enabled").notNull(),
  type: text("type").notNull(),
  addresses: text("addresses").notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertCampaign = typeof campaignsTable.$inferInsert;
export type SelectCampaign = typeof campaignsTable.$inferSelect;
