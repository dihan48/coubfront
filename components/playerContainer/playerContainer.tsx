import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Player } from "../player/player";
import { Item } from "@/pages";

import styles from "./playerContainer.module.css"

type IProps =
  {
    data: Item,
    audioRef: RefObject<HTMLAudioElement>,
    videoRef: RefObject<HTMLVideoElement>,
    index: number,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>> | null,
    setCurrentVideoIndex: React.Dispatch<React.SetStateAction<number>>,
    isShow: boolean
    isInteracted: boolean,
    setIsInteracted: React.Dispatch<React.SetStateAction<boolean>>,
    currentVideoIndex: number
  }

export function PlayerContainer({ data, audioRef, videoRef, index, page, setPage, setCurrentVideoIndex, isShow, isInteracted, setIsInteracted, currentVideoIndex }: IProps) {
  const [isPlay, setIsPlay] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options = {
      threshold: 0.75,
    };

    const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentVideoIndex(index);
          setPage?.(page + 1);
        }
        console.log({ index, setIsPlay: isInteracted && entry.isIntersecting })
        setIsPlay(isInteracted && entry.isIntersecting);
      });
    }

    const observer = new IntersectionObserver(callback, options);

    const element = ref.current;
    if (element) {
      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }
  }, [isInteracted, setCurrentVideoIndex, index, page, setPage]);

  return (
    <div className={styles.container} ref={ref}>
      {isShow ?
        <Player
          data={data}
          audioRef={audioRef}
          videoRef={videoRef}
          isPlay={isPlay}
          isInteracted={isInteracted}
          setIsInteracted={setIsInteracted}
          index={index}
          currentVideoIndex={currentVideoIndex}
        />
        : null}
    </div>
  );
}
