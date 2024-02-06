import {
  pgTable,
  pgEnum,
  bigint,
  timestamp,
  text,
  smallint,
} from "drizzle-orm/pg-core";
import { customVector } from "@useverk/drizzle-pgvector";

export const keyStatus = pgEnum("key_status", [
  "default",
  "valid",
  "invalid",
  "expired",
]);
export const keyType = pgEnum("key_type", [
  "aead-ietf",
  "aead-det",
  "hmacsha512",
  "hmacsha256",
  "auth",
  "shorthash",
  "generichash",
  "kdf",
  "secretbox",
  "secretstream",
  "stream_xchacha20",
]);
export const factorType = pgEnum("factor_type", ["totp", "webauthn"]);
export const factorStatus = pgEnum("factor_status", ["unverified", "verified"]);
export const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", [
  "s256",
  "plain",
]);

export const books = pgTable("books", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint("id", { mode: "number" }).primaryKey().notNull(),
  insertedAt: timestamp("inserted_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  authors: text("authors"),
  lang: text("lang"),
  img: text("img"),
  year: smallint("year"),
  description: text("description"),
});

export const vectors = pgTable("vectors", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull(),
  insertedAt: timestamp("inserted_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  item_id: bigint("item_id", { mode: "number" })
    .references(() => books.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  embedding: customVector("embedding", { dimensions: 384 }).notNull(),
  chunk: text("chunk").notNull(),
});
