"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import styles from "./player.module.css";
import { Item } from "@/pages";

export function Player({ data, audioRef, isPlay }:
  { data: Item, audioRef: RefObject<HTMLAudioElement>, isPlay: boolean }) {
  const {
    permalink,
    videoMed,
    videoHigh,
    videoHigher,
    audioMed,
    title,
    picture,
  } = data;

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isPlayed, setIsPlayed] = useState(false);

  const play = useCallback(
    async function () {
      const audio = audioRef.current;
      if (audio) {
        audio.src = audioMed?.url || "";

        if (audioMed?.url) {
          audio.load();

          const canPlay = () => {
            audio.removeEventListener("canplay", canPlay);
            // console.log("canplay");

            if (videoRef.current) {
              videoRef.current.play();
              setIsPlayed(true);
            }

            audio
              .play()
              .then(() => {
                if (videoRef.current) {
                  audio.currentTime = videoRef.current.currentTime;
                }
              })
              .catch((error) => {
                console.log(error);
                // console.log("setIsSoundOn(false)");
                setIsSoundOn(false);
              });
          }


          audio.addEventListener("canplay", canPlay);
        } else {
          console.log("audio empty")
          if (videoRef.current) {
            videoRef.current.play();
            setIsPlayed(true);
          }
        }
      }
    },
    [audioRef, audioMed]
  );

  const stop = useCallback(
    function () {
      const audio = audioRef.current;
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlayed(false);
      }
      // audio.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      if (audio) {
        audio.currentTime = 0;
      }
    },
    [audioRef]
  );

  useEffect(() => {
    const winWidth = typeof window === "object" ? window.innerWidth : 0;

    const video = videoRef.current;
    const audio = audioRef.current;
    if (video && audio) {
      if (winWidth >= 1200 && winWidth < 1560) {
        video.src = videoHigh?.url || "";
      }

      if (winWidth >= 1560) {
        video.src = videoHigher?.url || "";
      }

      if (video.src === "") {
        video.src = videoMed?.url || "";
      }

      video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.preload = "auto";

      audio.setAttribute("autoplay", "");
      audio.setAttribute("muted", "");
      audio.setAttribute("playsinline", "");
      audio.volume = 0.05;
    }
  }, [videoHigh?.url, videoHigher?.url, videoMed?.url, audioRef]);

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

  return (
    <div className={styles.container}>
      {isSoundOn === false ? (
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
      <video
        className={styles.video}
        src={videoMed?.url || ""}
        preload="none"
        // poster={picture || ""}
        loop={true}
        muted={true}
        ref={videoRef}
        controlsList="nodownload"
      />
      <a href={`https://coub.com/view/${permalink}`} className={styles.link}>{title}</a>
    </div>
  );
}