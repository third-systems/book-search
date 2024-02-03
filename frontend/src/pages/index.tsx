import { generateSSGHelper } from "@/server/helper/ssgHelper";
import { type GetStaticPropsContext } from "next";
import { api } from "@/utils/api";
import BookCard from "@/components/book-card";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useIntersection } from "@mantine/hooks"; // a hook that we'll be using to detect when the user reaches the bottom of the page

const Home = () => {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } =
    api.book.getBooks.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const viewportRef = useRef<HTMLLIElement>(null);
  // a ref to the last post element
  const { entry, ref } = useIntersection({
    root: viewportRef.current,
    threshold: 1,
  });

  // memoize the data so they don't get re-rendered on every re-render
  const books = useMemo(() => {
    return data?.pages.flatMap((page) => page.books) ?? [];
  }, [data]);

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage()
        .then()
        .catch((e) => console.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  console.log(books.length);
  return (
    <main className="flex h-full w-full flex-col items-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Bookish
        </h1>
        <ul className="books-grid w-1/2">
          {books.map((book, i) => (
            <>
              {i === books.length - 1 ? (
                <li ref={ref} key={book.id} className="flex">
                  <BookCard
                    id={book.id}
                    title={book.title ?? ""}
                    img={book.img ?? ""}
                  />
                </li>
              ) : (
                <li key={book.id} className="flex">
                  <BookCard
                    id={book.id}
                    title={book.title ?? ""}
                    img={book.img ?? ""}
                  />
                </li>
              )}
            </>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Home;

// export async function getStaticProps(context: GetStaticPropsContext) {
//   const ssg = generateSSGHelper();
//   await ssg.book.getBooks.prefetch({ cursor: 0 });
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//     },
//   };
// }
