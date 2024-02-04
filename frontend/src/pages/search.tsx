import BookCard from "@/components/book-card";
import { Searchbar } from "@/components/search";
import { Spinner } from "@/components/spinner";
import { api } from "@/utils/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

interface IEvent {
  status: string;
  progress: number;
  output: number[];
}

const SearchPage = () => {
  const workerRef = useRef<Worker>();
  const [ready, setReady] = useState(false);
  const {
    mutate,
    data: searchResults,
    isLoading,
    reset,
  } = api.book.findSimilarBooks.useMutation();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../lib/ai.worker.ts", import.meta.url),
    );

    const onMessageReceived = (event: MessageEvent<IEvent>) => {
      console.log(event.data);
      switch (event.data.status) {
        case "initiate":
          setReady(false);
          break;
        case "ready":
          setReady(true);
          break;
        case "progress":
          break;
        case "complete":
          mutate(event.data.output);
          break;
      }
    };

    // Attach the callback function as an event listener.
    workerRef.current.addEventListener("message", onMessageReceived);

    return () => {
      workerRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { query } = useRouter();
  const searchTerm = query.query ?? "";

  useEffect(() => {
    console.log(searchTerm);
    if (searchTerm) {
      workerRef.current?.postMessage({ text: searchTerm });
    } else {
      if (searchResults) {
        reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <>
      <section className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="flex w-full items-center justify-center">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Link>
          <Searchbar />
        </div>
        {searchTerm === "" && <Sample />}
        {isLoading && <Spinner />}
        {ready ? (
          <ul className="books-grid w-1/2 items-center">
            {searchResults?.map((book) => (
              <li key={book.id} className="flex">
                <BookCard
                  id={book.id}
                  title={book.title ?? ""}
                  img={book.img ?? ""}
                  url={book.url ?? ""}
                />
              </li>
            ))}
          </ul>
        ) : (
          <></>
        )}
      </section>
    </>
  );
};

const Sample = () => {
  return <section></section>;
};

export default SearchPage;
