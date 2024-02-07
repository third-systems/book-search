import BookCard from "@/components/book-card";
import { Spinner } from "@/components/spinner";
import { generateSSGHelper } from "@/server/helper/ssgHelper";
import { api } from "@/utils/api";
import { useIntersection } from "@mantine/hooks"; // a hook that we'll be using to detect when the user reaches the bottom of the page
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

const Home = () => {
  const { data, fetchNextPage, isFetchingNextPage } =
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

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
      <div className="flex w-1/2 items-center justify-between">
        <h1 className="w-1/2 text-3xl font-extrabold tracking-tight">
          Bookish
        </h1>
        <Link
          href="/search"
          className="flex items-center rounded-sm border border-slate-300 py-1 pl-2 pr-6 hover:ring-1 hover:ring-slate-300"
        >
          <Search className="mr-2 h-5 w-5 text-gray-600" />
          <span className="text-gray-600">Search for a book...</span>
        </Link>
      </div>
      <ul className="books-grid w-1/2 items-center">
        {books.map((book, i) => (
          <>
            {i === books.length - 1 ? (
              <li ref={ref} key={book.id} className="flex">
                <BookCard
                  id={book.id}
                  title={book.title ?? ""}
                  img={book.s3Img ?? ""}
                  url={book.url ?? ""}
                />
              </li>
            ) : (
              <li key={book.id} className="flex">
                <BookCard
                  id={book.id}
                  title={book.title ?? ""}
                  img={book.s3Img ?? ""}
                  url={book.url ?? ""}
                />
              </li>
            )}
          </>
        ))}
      </ul>
      {isFetchingNextPage && <Spinner />}
    </div>
  );
};

export default Home;

export async function getStaticProps() {
  const ssg = generateSSGHelper();
  await ssg.book.getBooks.prefetch({ cursor: 0 });

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}
