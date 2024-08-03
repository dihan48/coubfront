import type { Item } from "@/helpers/core";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { useCurrentVideoIndex } from "../videoList/videoList";
import {
  getVideoSrc,
  usePlayerHandles,
  useVideoPlayed,
} from "../playerCore/playerCore";

import { PlayerUI } from "../playUI/playerUI";
import useIsLogin from "@/hooks/useIsLogin";
import { useSection } from "@/hooks/useSection";

import styles from "./player.module.css";
import { decimalToBase62 } from "@/helpers/utils";
import Link from "next/link";

export function Player({ data, index }: IProps) {
  const { id, permalink, audioMed, title } = data;

  const videoId = id ? decimalToBase62(id) : null;

  const [videoPlayed, setVideoPlayed] = useVideoPlayed();
  const currentVideoIndex = useCurrentVideoIndex();
  const [isLogin, setIsLogin] = useIsLogin();
  const playerHandles = usePlayerHandles();
  const section = useSection();

  const playerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const isCentered = index === currentVideoIndex;

  const setupPlayer = useCallback(
    () => playerHandles.setupPlayer(playerRef, data),
    [playerHandles, data]
  );

  useEffect(() => {
    if (isCentered) {
      setupPlayer();
    }
  }, [isCentered, setupPlayer]);

  useEffect(() => {
    if (isCentered) {
      if (videoPlayed) {
        playerHandles.tryPlay();

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (isLogin && section === "self") {
          const t = setTimeout(() => {
            if (id) {
              fetch("/api/view", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ videoId: id }),
              });
            }
          }, 750);

          debounceTimeout.current = t;

          return () => {
            clearTimeout(t);
          };
        }
      } else {
        playerHandles.stop();
      }
    } else {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    }
  }, [isCentered, videoPlayed, playerHandles, id, isLogin, section]);

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
      {section === "self" ? (
        <Link href={`/view/${videoId}`} className={styles.link}>
          {title}
        </Link>
      ) : (
        <a href={`https://coub.com/view/${permalink}`} className={styles.link}>
          {title}
        </a>
      )}

      <Image
        src={data.picture || ""}
        alt=""
        style={isCentered ? {} : { opacity: 0.3 }}
        className={styles.preview_image}
        width={960}
        height={960}
        placeholder={data.blurDataURL ? "blur" : "empty"}
        blurDataURL={data.blurDataURL || undefined}
        unoptimized={true}
        priority={true}
      />
      <video hidden src={getVideoSrc(data)} />
      <audio hidden src={audioMed || ""} />
      <div ref={playerRef} className={styles.player} />
      <PlayerUI count={data?.count} />
    </div>
  );
}

interface IProps {
  data: Item;
  index: number;
}
