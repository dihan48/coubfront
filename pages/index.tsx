import type { Item } from "@/helpers/core";
import Head from "next/head";
import { Inter } from "next/font/google";
import { VideoList } from "../components/videoList/videoList";
import { fetchCoubs } from "@/helpers/fetchApi";

import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home({ coubs }: { coubs: Array<Item> }) {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <main className={`${styles.main} ${inter.className}`}>
          <VideoList list={coubs} />
        </main>
      </div>
    </>
  );
}

export const getStaticProps = async () => {
  const coubs = await fetchCoubs(
    "https://coub.com/api/v2/timeline/subscriptions/fresh?page=1"
  );

  return {
    props: { coubs },
    revalidate: 10,
  };
};
