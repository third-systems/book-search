import { books, vectors } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { Bucket } from "sst/node/bucket";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
          url: books.url,
        })
        .from(books)
        .limit(limit + 1)
        .offset(cursor);

      const recordsWithS3 = appendS3(data);

      let nextCursor: typeof cursor | undefined = undefined;
      if (recordsWithS3.length > limit) {
        recordsWithS3.pop();
        nextCursor = cursor + data.length;
      }

      return {
        books: recordsWithS3,
        nextCursor,
      };
    }),
  findSimilarBooks: publicProcedure
    .input(z.array(z.number()))
    .mutation(async ({ ctx, input }) => {
      try {
        const { db } = ctx;

        const response = await db
          .select({
            id: books.id,
            title: books.title,
            url: books.url,
            score: sql<number>`1 - (embedding <=> ${JSON.stringify(input)})`,
            text: vectors.chunk,
          })
          .from(books)
          .innerJoin(vectors, eq(books.id, vectors.item_id))
          .orderBy(sql`embedding <=> ${JSON.stringify(input)}`)
          .limit(25);

        const ranks = getRanks(response);
        const dataWithS3 = ranks.map((r) => {
          return {
            ...r,
            s3Img: `https://${Bucket.Assets.bucketName}.s3.amazonaws.com/covers/${r.id}.jpg`,
          };
        });
        return dataWithS3;
      } catch (error) {
        console.error(error);
      }
    }),
});

const appendS3 = (data: { id: number; title: string; url: string }[]) => {
  const dataWithS3 = data.map((r) => {
    return {
      ...r,
      s3Img: `https://${Bucket.Assets.bucketName}.s3.amazonaws.com/covers/${r.id}.jpg`,
    };
  });

  return dataWithS3;
};

const getRanks = (
  data: { id: number; title: string; score: number; text: string }[],
) => {
  const results: Record<
    string,
    { id: number; title: string; score: number; text: string }
  > = {};
  for (const d of data) {
    const { id, score } = d;
    if (score < 0.79) continue;

    if (results[id]) {
      results[id]!.score += score;
    } else {
      results[id] = {
        ...d,
      };
    }
  }

  const sorted = Object.values(results).sort((a, b) => b.score - a.score);
  return sorted;
};
