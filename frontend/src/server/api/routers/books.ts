import { books, reviews } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { inArray, sql } from "drizzle-orm";

export const bookRouter = createTRPCRouter({
  getBooks: publicProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit } = input;
      const cursor = input.cursor ?? 0;

      const data = await db
        .select({
          id: books.id,
          title: books.title,
          img: books.img,
          url: books.url,
        })
        .from(books)
        .limit(limit + 1)
        .offset(cursor);

      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        data.pop();
        nextCursor = cursor + data.length;
      }

      return {
        books: data,
        nextCursor,
      };
    }),
  findSimilarBooks: publicProcedure
    .input(z.array(z.number()))
    .mutation(async ({ ctx, input }) => {
      try {
        const { db } = ctx;
        const res = (await db.execute(
          sql`SELECT book_id FROM ${reviews} ORDER BY embedding <-> ${JSON.stringify(input)} LIMIT 25;`,
        )) as { book_id: number }[];

        const bookCounts: Record<number, number> = {};
        res.forEach((book) => {
          if (bookCounts[book.book_id]) {
            bookCounts[book.book_id] += 1;
          } else {
            bookCounts[book.book_id] = 1;
          }
        });
        const bookIds = Object.keys(bookCounts).flatMap((key) => parseInt(key));

        const bookMeta = await db
          .select({
            id: books.id,
            title: books.title,
            img: books.img,
            url: books.url,
          })
          .from(books)
          .where(inArray(books.id, bookIds));

        return bookMeta;
      } catch (error) {
        console.error(error);
      }
    }),
});
