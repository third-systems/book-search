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
      <section className="flex w-full flex-col items-center justify-center gap-6 p-4 lg:container lg:gap-12 lg:px-4 lg:py-16">
        <div className="flex w-full items-center lg:w-1/2 lg:justify-center">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Link>
          <Searchbar />
        </div>
        {searchTerm === "" && <Sample />}
        {isLoading && <Spinner />}
        {ready ? (
          <ul className="books-grid w-full items-center lg:w-1/2">
            {searchResults?.map((book) => (
              <li key={book.id} className="flex">
                <BookCard
                  id={book.id}
                  title={book.title}
                  img={book.s3Img}
                  url={book.url}
                  text={book.text ?? ""}
                  score={book.score}
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
