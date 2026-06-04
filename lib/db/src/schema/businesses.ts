import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessesTable = pgTable("businesses", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAm: text("name_am"),
  nameOrm: text("name_orm"),
  descriptionEn: text("description_en"),
  descriptionAm: text("description_am"),
  descriptionOrm: text("description_orm"),
  categoryId: integer("category_id").notNull(),
  city: text("city"),
  subcity: text("subcity"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logoUrl: text("logo_url"),
  gallery: text("gallery").array().notNull().default([]),
  services: text("services").array().notNull().default([]),
  products: text("products").array().notNull().default([]),
  socialLinks: jsonb("social_links").$type<{
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    telegram?: string | null;
  }>().notNull().default({}),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  verified: boolean("verified").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  claimStatus: text("claim_status"),
  ownerId: text("owner_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessesTable.$inferSelect;
