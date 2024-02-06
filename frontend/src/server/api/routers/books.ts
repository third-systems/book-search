import { books, vectors } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { inArray, sql } from "drizzle-orm";
import { Bucket } from "sst/node/bucket";

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

        const res = await db
          .select({
            item_id: vectors.item_id,
            score: sql<number>`1 - (embedding <=> ${JSON.stringify(input)})`,
            text: vectors.chunk,
          })
          .from(vectors)
          .orderBy(sql`embedding <=> ${JSON.stringify(input)}`)
          .limit(25);

        const ranked = getRanks(res);

        const bookIds = res.map((r) => r.item_id);
        const metaData = await db
          .select({
            id: books.id,
            title: books.title,
            url: books.url,
          })
          .from(books)
          .where(inArray(books.id, bookIds));

        const metaDataWithS3 = appendS3(metaData);

        const resultsWithTextAndScores = [];
        for (const entry of metaDataWithS3) {
          const rankedEntry = ranked.find((r) => r.item_id === entry.id);
          if (!rankedEntry) continue;

          const { text, score } = rankedEntry;
          resultsWithTextAndScores.push({ ...entry, text, score });
        }

        return resultsWithTextAndScores.sort((a, b) => b.score - a.score);
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
  data: { item_id: number; score: number; text: string | null }[],
) => {
  const results: Record<string, (typeof data)[number]> = {};
  for (const result of data) {
    const { item_id, score, text } = result;
    if (score < 0.79) continue;

    if (!results[item_id]) {
      results[result.item_id] = {
        item_id,
        score: 0,
        text,
      };
    }

    results[item_id]!.score += score;
  }

  const sorted = Object.values(results).sort((a, b) => b.score - a.score);
  return sorted;
};
