import { books } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

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
        })
        .from(books)
        .limit(limit + 1)
        .offset(cursor);

      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        data.pop();
        nextCursor = cursor + data.length;
        console.log("nextCursor", nextCursor);
      }

      return {
        books: data,
        nextCursor,
      };
    }),
});
