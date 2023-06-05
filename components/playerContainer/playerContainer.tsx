import { MutableRefObject, RefObject, memo, useEffect, useRef } from "react";
import { Item } from "@/pages";
import { PlayerLayer } from "./playerLayer";

import styles from "./playerContainer.module.css";

type IProps = {
  data: Item;
  audioRef: RefObject<HTMLAudioElement>;
  videoRef: RefObject<HTMLVideoElement>;
  index: number;
  mapItemsRef: MutableRefObject<Map<Element, { index: number }>>;
  observerRef: MutableRefObject<IntersectionObserver | null>;
  isShow: boolean;
};

export type IPlayerHandles = {
  play: () => void;
  pause: () => void;
  soundOn: () => void;
};

export const PlayerContainer = memo(function PlayerContainer({
  data,
  audioRef,
  videoRef,
  index,
  mapItemsRef,
  observerRef,
  isShow,
}: IProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const observer = observerRef.current;
    if (element && observer) {
      mapItemsRef.current.set(element, { index });

      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }
  }, [index, mapItemsRef, observerRef]);

  return (
    <div className={styles.container} ref={ref}>
      {isShow && (
        <PlayerLayer
          data={data}
          audioRef={audioRef}
          videoRef={videoRef}
          index={index}
        />
      )}
    </div>
  );
});
