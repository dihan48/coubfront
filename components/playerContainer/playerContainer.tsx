import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Player } from "../player/player";

import styles from "./playerContainer.module.css"
import { Item } from "@/pages";

type IProps =
  {
    data: Item,
    audioRef: RefObject<HTMLAudioElement>,
    index: number,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>> | null,
    setCurrentVideoIndex: React.Dispatch<React.SetStateAction<number>>,
    isShow: boolean
  }

export function PlayerContainer({ data, audioRef, index, page, setPage, setCurrentVideoIndex, isShow }: IProps) {
  const [isPlay, setIsPlay] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const callback = useCallback((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setCurrentVideoIndex(index);
        setPage?.(page + 1);
      }
      setIsPlay(entry.isIntersecting);
    });
  }, [setCurrentVideoIndex, index, page, setPage])

  useEffect(() => {
    const options = {
      threshold: 0.75,
    };

    const observer = new IntersectionObserver(callback, options);

    const element = ref.current;
    if (element) {
      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }
  }, [callback]);

  return (
    <div className={styles.container} ref={ref}>
      {isShow ? <Player data={data} audioRef={audioRef} isPlay={isPlay} /> : null}
    </div>
  );
}
