import { RefObject, useEffect, useRef, useState } from "react";
import { Item } from "@/pages";
import { PlayerLayer } from "./playerLayer";

import styles from "./playerContainer.module.css";

type IProps = {
  data: Item;
  audioRef: RefObject<HTMLAudioElement>;
  videoRef: RefObject<HTMLVideoElement>;
  index: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>> | null;
  setCurrentVideoIndex: React.Dispatch<React.SetStateAction<number>>;
  isShow: boolean;
  currentVideoIndex: number;
};

export type IPlayerHandles = {
  play: () => void;
  pause: () => void;
  soundOn: () => void;
};

export function PlayerContainer({
  data,
  audioRef,
  videoRef,
  index,
  page,
  setPage,
  setCurrentVideoIndex,
  isShow,
  currentVideoIndex,
}: IProps) {
  const [isCentered, setIsCentered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options = {
      threshold: 0.75,
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentVideoIndex(index);
          setPage?.(page + 1);
        }
        setIsCentered(entry.isIntersecting);
      });
    };

    const observer = new IntersectionObserver(callback, options);

    const element = ref.current;
    if (element) {
      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }
  }, [setCurrentVideoIndex, index, page, setPage]);

  return (
    <div className={styles.container} ref={ref}>
      {isShow && (
        <PlayerLayer
          data={data}
          audioRef={audioRef}
          videoRef={videoRef}
          index={index}
          currentVideoIndex={currentVideoIndex}
          isCentered={isCentered}
        />
      )}
    </div>
  );
}
