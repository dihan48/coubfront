import Image from "next/image";
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Item } from "@/pages";
import { IPlayerHandles } from "../playerContainer/playerContainer";
import { useAudioPlayed, useVideoPlayed } from "../playerContainer/playerLayer";
import { useCurrentVideoIndex } from "../videoList/videoList";

import styles from "./player.module.css";

type IProps = {
  data: Item;
  audioRef: RefObject<HTMLAudioElement>;
  videoRef: RefObject<HTMLVideoElement>;
  index: number;
  playerHandlesRef: MutableRefObject<IPlayerHandles>;
};

export function Player({
  data,
  audioRef,
  videoRef,
  index,
  playerHandlesRef,
}: IProps) {
  const { permalink, audioMed, title } = data;

  const [videoPlayed, setVideoPlayed] = useVideoPlayed();
  const [audioPlayed, setAudioPlayed] = useAudioPlayed();
  const currentVideoIndex = useCurrentVideoIndex();

  const playerRef = useRef<HTMLDivElement>(null);
  const audioCanPlayRef = useRef(false);
  const videoCanPlayRef = useRef(false);

  const isCentered = index === currentVideoIndex;

  const tryPlay = useCallback(
    function () {
      const audio = audioRef.current;
      const video = videoRef.current;

      if (
        audio &&
        video &&
        audioCanPlayRef.current &&
        videoCanPlayRef.current
      ) {
        Promise.all([
          audio
            .play()
            .then(() => true)
            .catch(() => false),
          video
            .play()
            .then(() => true)
            .catch(() => false),
        ]).then((values) => {
          const [audioPlay, videoPlay] = values;

          if (audioPlay === false && videoPlay === false) {
            setVideoPlayed(false);
          }

          if (audioPlay === false && videoPlay === true) {
            setAudioPlayed(false);
            setVideoPlayed(true);

            audio.muted = true;
          }

          if (audioPlay === true && videoPlay === true) {
            setVideoPlayed(true);
          }
        });
      }
    },
    [audioRef, videoRef, setVideoPlayed, setAudioPlayed]
  );

  const stop = useCallback(
    function () {
      const audio = audioRef.current;
      const video = videoRef.current;

      if (audio && video) {
        video.pause();
        video.currentTime = 0;

        audio.pause();
        audio.currentTime = 0;

        setVideoPlayed(false);
      }
    },
    [audioRef, videoRef, setVideoPlayed]
  );

  const soundOn = useCallback(
    function () {
      const audio = audioRef.current;
      const video = videoRef.current;
      if (audio && video) {
        audio.muted = false;

        audio.play().then(() => {
          audio.currentTime = video.currentTime;
          setAudioPlayed(true);
        });
      }
    },
    [audioRef, videoRef, setAudioPlayed]
  );

  playerHandlesRef.current.play = tryPlay;
  playerHandlesRef.current.pause = stop;
  playerHandlesRef.current.soundOn = soundOn;

  useEffect(() => {
    if (isCentered) {
      const audio = audioRef.current;
      const video = videoRef.current;
      const player = playerRef.current;

      if (audio && video && player) {
        player.append(video);

        const { audioMed, picture } = data;

        audio.src = audioMed?.url || "";
        video.src = getVideoSrc(data);
        video.poster = picture || "";

        video.load();
        audio.load();

        const audioCanPlay = () => {
          audio.removeEventListener("canplay", audioCanPlay);
          audioCanPlayRef.current = true;
          tryPlay();
        };

        const videoCanPlay = () => {
          video.removeEventListener("canplay", videoCanPlay);
          videoCanPlayRef.current = true;
          tryPlay();
        };

        audio.addEventListener("canplay", audioCanPlay);
        video.addEventListener("canplay", videoCanPlay);

        return () => {
          audio.removeEventListener("canplay", audioCanPlay);
          video.removeEventListener("canplay", videoCanPlay);
        };
      }
    }
  }, [isCentered, audioRef, videoRef, data, tryPlay]);

  useEffect(
    () => void (isCentered && videoPlayed ? tryPlay() : stop()),
    [isCentered, videoPlayed, tryPlay, stop]
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
      <audio hidden src={audioMed?.url || ""} />
      <div ref={playerRef} className={styles.player} />
    </div>
  );
}

function getVideoSrc(data: Item) {
  const { videoMed, videoHigh, videoHigher } = data;

  const winWidth = typeof window === "object" ? window.innerWidth : 0;

  let videoSrc = videoMed?.url || "";
  if (winWidth >= 1200 && winWidth < 1560) {
    videoSrc = videoHigh?.url || videoMed?.url || "";
  }

  if (winWidth >= 1560) {
    videoSrc = videoHigher?.url || videoMed?.url || "";
  }

  return videoSrc;
}
