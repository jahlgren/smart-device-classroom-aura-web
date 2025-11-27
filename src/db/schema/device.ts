import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const device = pgTable("device", {
  id: varchar("id", { length: 6 }).primaryKey(),
  description: text("description"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
  }
);

export type Device = InferSelectModel<typeof device>;
