import type { Item } from "@/pages";
import type { MutableRefObject, RefObject } from "react";
import { memo, useEffect, useRef } from "react";
import { PlayerLayer } from "./playerLayer";

import styles from "./playerContainer.module.css";

export const PlayerContainer = memo(function PlayerContainer({
  data,
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
      {isShow && <PlayerLayer data={data} index={index} />}
    </div>
  );
});

interface IProps {
  data: Item;
  index: number;
  mapItemsRef: MutableRefObject<Map<Element, { index: number }>>;
  observerRef: RefObject<IntersectionObserver | null>;
  isShow: boolean;
}
