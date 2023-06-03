"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import styles from "./player.module.css";
import { Item } from "@/pages";
import Image from "next/image";

type IProps =
  {
    data: Item,
    audioRef: RefObject<HTMLAudioElement>,
    videoRef: RefObject<HTMLVideoElement>,
    isPlay: boolean,
    isInteracted: boolean,
    setIsInteracted: React.Dispatch<React.SetStateAction<boolean>>
    index: number,
    currentVideoIndex: number
  }

export function Player({ data, audioRef, videoRef, isPlay, isInteracted, setIsInteracted, index, currentVideoIndex }: IProps) {
  const {
    permalink,
    videoMed,
    videoHigh,
    videoHigher,
    audioMed,
    title,
    picture,
  } = data;

  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isPlayed, setIsPlayed] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const audioCanPlayRef = useRef(false);
  const videoCanPlayRef = useRef(false);

  const play = useCallback(
    async function () {
      const audio = audioRef.current;
      const video = videoRef.current;

      if (audio && video) {
        audio.src = audioMed?.url || "";

        video.src = videoMed?.url || "";

        const winWidth = typeof window === "object" ? window.innerWidth : 0;

        if (winWidth >= 1200 && winWidth < 1560) {
          video.src = videoHigh?.url || videoMed?.url || "";
        }

        if (winWidth >= 1560) {
          video.src = videoHigher?.url || videoMed?.url || "";
        }

        video.load();
        audio.load();

        const audioCanPlay = () => {
          audio.removeEventListener("canplay", audioCanPlay);
          console.log("audio canplay");
          audioCanPlayRef.current = true;
          play();
        }

        const videoCanPlay = () => {
          video.removeEventListener("canplay", videoCanPlay);
          console.log("video canplay");
          videoCanPlayRef.current = true;
          play();
        }

        const play = () => {
          if (audioCanPlayRef.current && videoCanPlayRef.current) {
            const audio = audioRef.current;
            const video = videoRef.current;

            if (video && audio) {
              audio.play().then(() => {
                console.log("audio.play")
              }).catch((error) => {
                console.log("audio.play error: ", error)
              });

              video.play().then(() => {
                console.log("video.play")
              }).catch((error) => {
                console.log("video.play error: ", error)
              });
            }
          }
        }

        audio.addEventListener("canplay", audioCanPlay);
        video.addEventListener("canplay", videoCanPlay);
      }
    },
    [audioRef, audioMed?.url, videoMed?.url, videoHigh?.url, videoHigher?.url, videoRef]
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

        setIsPlayed(false);
      }
    },
    [audioRef, videoRef]
  );

  useEffect(() => {
    if (isPlay) {
      if (isPlayed === false) {
        play();
      }
    } else {
      if (isPlayed) {
        stop();
        setIsSoundOn(true);
      }
    }
  }, [isPlay, isPlayed, play, stop])

  useEffect(() => {
    if (index === currentVideoIndex) {
      const audio = audioRef.current;
      const video = videoRef.current;
      const player = playerRef.current;

      if (audio && video && player) {
        console.log("audio && video && player");

        player.append(video);

        audio.src = audioMed?.url || "";

        const winWidth = typeof window === "object" ? window.innerWidth : 0;

        video.src = videoMed?.url || "";
        if (winWidth >= 1200 && winWidth < 1560) {
          video.src = videoHigh?.url || videoMed?.url || "";
        }

        if (winWidth >= 1560) {
          video.src = videoHigher?.url || videoMed?.url || "";
        }

        video.load();
        audio.load();
      } else {
        console.log("!!! audio && video && player");
        console.log({
          audio,
          video,
          player,
        })
      }
    }
  }, [index, currentVideoIndex, audioRef, videoRef, audioMed?.url, videoMed?.url, videoHigh?.url, videoHigher?.url])

  return (
    <>    {isSoundOn === false ? (
      <button
        className={styles.sound_button}
        onClick={() => {
          setIsSoundOn(true);
          if (audioRef.current) {
            audioRef.current
              .play()
              .then(() => {
                if (audioRef.current && videoRef.current) {
                  audioRef.current.currentTime = videoRef.current.currentTime;
                }
              })
              .catch((error) => {
                console.log(error);
                setIsSoundOn(false);
              });
          }
        }}
      >
        sound on
      </button>
    ) : null}
      <div className={styles.container} onClick={() => {
        firstApplePlay(videoRef, audioRef);
        setIsInteracted(v => !v);
      }}>
        <a href={`https://coub.com/view/${permalink}`} className={styles.link}>{title}</a>
        {isInteracted ?
          null :
          <button className={styles.play_button}>
            <svg viewBox="-0.5 0 7 7" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.495 2.573 1.5.143C.832-.266 0 .25 0 1.068V5.93c0 .82.832 1.333 1.5.927l3.995-2.43c.673-.41.673-1.445 0-1.855"
                fill="#fff" fillRule="evenodd" />
            </svg>
          </button>
        }
        <Image
          src={data.picture || ""}
          alt=""
          style={currentVideoIndex === index ? {} : { opacity: 0.3 }}
          className={styles.preview_image}
          width={960}
          height={960}
          placeholder={data.blurDataURL ? "blur" : "empty"}
          blurDataURL={data.blurDataURL || undefined}
        />
        <div ref={playerRef} className={styles.player} />
      </div>
    </>
  );
}

function firstApplePlay(videoRef: RefObject<HTMLVideoElement>, audioRef: RefObject<HTMLAudioElement>) {
  const video = videoRef.current;
  const audio = audioRef.current;

  if (video && audio) {
    console.log(video, audio);
    console.log(video.src, audio.src);

    video.play();
    video.pause();
    audio.currentTime = 0;

    audio.play();
    audio.pause();
    video.currentTime = 0;
  }
}