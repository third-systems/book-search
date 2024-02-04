import Head from "next/head";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

interface Props {
  children: React.ReactNode;
}

const RootLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Bookish | Search Your Next Book</title>
        <meta name="description" content="Bookish | Search Your Next Book" />
      </Head>
      <main
        className={cn(
          "flex h-full w-full flex-col items-center font-sans antialiased",
          fontSans.variable,
        )}
      >
        {children}
      </main>
    </>
  );
};

export default RootLayout;
