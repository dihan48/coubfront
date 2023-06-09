import type { ReactElement } from "react";
import { useRef } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar/navbar";

import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }: LayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <Head>
        <title>TrueCoub</title>
        <meta
          name="description"
          content="Простой фронтенд для сайта коротких видео coub.com"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.container} ${inter.className}`} ref={ref}>
        <Navbar scrollRef={ref} />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}

interface LayoutProps {
  children: ReactElement;
}
