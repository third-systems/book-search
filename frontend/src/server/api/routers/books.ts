import { books } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { sql } from "drizzle-orm";

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

        const res = await db
          .select({
            id: books.id,
            title: books.title,
            img: books.img,
            url: books.url,
          })
          .from(books)
          .orderBy(sql`embedding <-> ${JSON.stringify(input)}`)
          .limit(25);

        return res;
      } catch (error) {
        console.error(error);
      }
    }),
});
