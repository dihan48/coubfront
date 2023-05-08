"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./player.module.css";

export function Player({ data, audioRef }) {
  const {
    permalink,
    videoMed,
    videoHigh,
    videoHigher,
    audioMed,
    title,
    picture,
  } = data;

  const videoRef = useRef();

  const [isSoundOn, setIsSoundOn] = useState(true);

  const play = useCallback(
    async function () {
      const audio = audioRef.current;

      audio.src = audioMed?.url;
      audio.load();
      // console.log("audio.load");

      function canPlay() {
        audio.removeEventListener("canplay", canPlay);
        // console.log("canplay");
        videoRef.current.play();
        audio
          .play()
          .then(() => {
            audio.currentTime = videoRef.current.currentTime;
            console.log("audio play");
          })
          .catch((error) => {
            console.log(error);
            // console.log("setIsSoundOn(false)");
            setIsSoundOn(false);
          });
      }

      audio.addEventListener("canplay", canPlay);
    },
    [audioRef, audioMed]
  );

  const stop = useCallback(
    function () {
      const audio = audioRef.current;

      videoRef.current.pause();
      console.log("audio.pause");
      // audio.pause();

      videoRef.current.currentTime = 0;
      audio.currentTime = 0;
    },
    [audioRef]
  );

  useEffect(() => {
    const winWidth = typeof window === "object" ? window.innerWidth : 0;

    const video = videoRef.current;
    const audio = audioRef.current;

    if (winWidth >= 1200 && winWidth < 1560) {
      video.src = videoHigh.url;
    }

    if (winWidth >= 1560) {
      video.src = videoHigher.url;
    }

    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.preload = "auto";

    audio.setAttribute("autoplay", "");
    audio.setAttribute("muted", "");
    audio.setAttribute("playsinline", "");
    audio.volume = 0.05;
  }, [videoHigh.url, videoHigher.url, audioRef]);

  useEffect(() => {
    const callback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play();
        } else {
          stop();
          setIsSoundOn(true);
        }
      });
    };

    const options = {
      threshold: 0.75,
    };

    const observer = new IntersectionObserver(callback, options);

    const video = videoRef.current;

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, [play, stop]);

  return (
    <div className={styles.wrapper}>
      {isSoundOn === false ? (
        <button
          className={styles.sound_button}
          onClick={() => {
            setIsSoundOn(true);

            audioRef.current
              .play()
              .then(() => {
                audioRef.current.currentTime = videoRef.current.currentTime;
              })
              .catch((error) => {
                console.log(error);
                setIsSoundOn(false);
              });
          }}
        >
          sound on
        </button>
      ) : null}
      <video
        className={styles.video}
        src={videoMed.url}
        preload="none"
        poster={picture}
        loop={true}
        muted={true}
        ref={videoRef}
        controlsList="nodownload"
      />
      <a href={`https://coub.com/view/${permalink}`} className={styles.link}>{title}</a>
    </div>
  );
}

export function PlayerContainer({ data, audioRef, callback }) {
  const [show, setShow] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const cb = (entries, observer) => {
      entries.forEach((entry) => {
        setShow(entry.isIntersecting);
        if (entry.isIntersecting) {
          callback?.();
        }
      });
    };

    const options = {
      rootMargin: "100px 0px 100px 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver(cb, options);

    const element = ref.current;

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback]);

  return (
    <div className={styles.container} ref={ref}>
      {show ? <Player data={data} audioRef={audioRef} /> : null}
    </div>
  );
}
