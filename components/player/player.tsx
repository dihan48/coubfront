import type { Item } from "@/helpers/core";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { useCurrentVideoIndex } from "../videoList/videoList";
import {
  getVideoSrc,
  usePlayerHandles,
  useVideoPlayed,
} from "../playerCore/playerCore";

import styles from "./player.module.css";

export function Player({ data, index }: IProps) {
  const { permalink, audioMed, title } = data;

  const [videoPlayed, setVideoPlayed] = useVideoPlayed();
  const currentVideoIndex = useCurrentVideoIndex();

  const playerRef = useRef<HTMLDivElement>(null);

  const isCentered = index === currentVideoIndex;

  const playerHandles = usePlayerHandles();

  const setupPlayer = useCallback(
    () => playerHandles.setupPlayer(playerRef, data),
    [playerHandles, data]
  );

  useEffect(() => {
    if (isCentered) {
      setupPlayer();
    }
  }, [isCentered, setupPlayer]);

  useEffect(
    () =>
      void (isCentered
        ? videoPlayed
          ? playerHandles.tryPlay()
          : playerHandles.stop()
        : 0),
    [isCentered, videoPlayed, playerHandles]
  );

  return (
    <div
      className={styles.container}
      style={
        isCentered
          ? {}
          : {
              transform: "scale(0.85)",
              borderRadius: "14px",
              borderWidth: "1px",
            }
      }
    >
      <a href={`https://coub.com/view/${permalink}`} className={styles.link}>
        {title}
      </a>
      <Image
        src={data.picture || ""}
        alt=""
        style={isCentered ? {} : { opacity: 0.3 }}
        className={styles.preview_image}
        width={960}
        height={960}
        placeholder={data.blurDataURL ? "blur" : "empty"}
        blurDataURL={data.blurDataURL || undefined}
      />
      <video hidden src={getVideoSrc(data)} />
      <audio hidden src={audioMed || ""} />
      <div ref={playerRef} className={styles.player} />
    </div>
  );
}

interface IProps {
  data: Item;
  index: number;
}
