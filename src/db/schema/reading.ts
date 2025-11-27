import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { device } from "./device";
import { InferSelectModel } from "drizzle-orm";

export const reading = pgTable("reading", {
  id: serial("id").primaryKey(),
  
  deviceId: text("device_id")
    .notNull()
    .references(() => device.id, {onDelete: "cascade"}),

  readingType: varchar("reading_type", {length: 32}).notNull(),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Reading = InferSelectModel<typeof reading>;
