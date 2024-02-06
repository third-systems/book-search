import Image from "next/image";
import styles from "./book-card.module.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface IBookCard {
  id: number;
  title: string;
  img: string;
  url: string;
  text?: string;
  score?: number;
}

export default function BookCard(props: IBookCard) {
  return (
    <div className="flex flex-col">
      {props.text ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger>
              <p className="my-2 line-clamp-2 bg-yellow-100 text-center text-xs font-semibold">
                {props.title}
              </p>
            </TooltipTrigger>
            <TooltipContent className="w-56 text-xs">
              {props.text}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <p className="my-2 line-clamp-2 bg-yellow-100 text-center text-xs font-semibold">
          {props.title}
        </p>
      )}
      <a
        target="_blank"
        title={props.title}
        href={props.url}
        className={styles.card}
      >
        <Image
          width={100}
          loading="lazy"
          height={150}
          src={props.img}
          alt={props.title}
          className={styles.cardImage}
        />
      </a>
      {props.score !== undefined && (
        <p className="my-1 text-center text-xs font-medium">
          Score: {Number(props.score.toFixed(2))}
        </p>
      )}
    </div>
  );
}
