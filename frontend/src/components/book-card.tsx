import Image from "next/image";
import styles from "./book-card.module.css";

interface IBookCard {
  id: number;
  title: string;
  img: string;
  url: string;
}

export default function BookCard(props: IBookCard) {
  return (
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
  );
}
