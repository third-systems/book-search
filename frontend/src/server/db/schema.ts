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
  url: text("url"),
  title: text("title"),
  authors: text("authors"),
  lang: text("lang"),
  img: text("img"),
  year: smallint("year"),
  description: text("description"),
});

export const reviews = pgTable("reviews", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint("id", { mode: "number" }).primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  bookId: bigint("book_id", { mode: "number" }).references(() => books.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  review: text("review"),
  // TODO: failed to parse database type 'vector'
  embedding: customVector("embedding", { dimensions: 384 }),
});
