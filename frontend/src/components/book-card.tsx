import Image from "next/image";
import Link from "next/link";
import styles from "./book-card.module.css";

interface IBookCard {
  id: number;
  title: string;
  img: string;
}

export default function BookCard(props: IBookCard) {
  return (
    <Link
      title={props.title}
      href={`/book/${props.id}`}
      prefetch={false}
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
    </Link>
  );
}
