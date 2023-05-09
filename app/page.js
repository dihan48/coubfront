import { Suspense } from "react";
import { VideoList } from "@/components/videoList/videoList";

import styles from "./page.module.css";

export default async function Home() {
  const dataPromise = fetch(
    "https://coub.com/api/v2/timeline/subscriptions/fresh?page=1",
    { next: { revalidate: 10 } }
  )
    .then((res) => res.json())
    .then((data) =>
      data.coubs.map((item) => {
        const newItem = {};

        newItem.permalink = item.permalink;
        newItem.videoMed = item.file_versions.html5.video.med;
        newItem.videoHigh = item.file_versions.html5.video.high;
        newItem.videoHigher = item.file_versions.html5.video.higher;
        newItem.audioMed = item.file_versions.html5.audio.med;
        newItem.title = item.title;
        newItem.picture = item.picture;

        return newItem;
      })
    );

  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <VideoListWrapper listPromise={dataPromise} />
      </Suspense>
    </main>
  );
}

async function VideoListWrapper({ listPromise }) {
  const list = await listPromise;
  return <VideoList list={list} />;
}
