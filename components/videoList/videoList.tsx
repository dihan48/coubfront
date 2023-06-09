import type { Item, SiteSection } from "@/helpers/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PlayerContainer } from "../playerContainer/playerContainer";
import { createObserver, getIsShowPlayer } from "@/helpers/core";
import { PlayerCore } from "../playerCore/playerCore";

const CurrentVideoIndexContext = createContext<number>(0);

export function useCurrentVideoIndex() {
  const context = useContext(CurrentVideoIndexContext);
  if (context === undefined) {
    throw new Error(
      "useIsInteracted must be used within a IsInteractedContext.Provider"
    );
  }
  return context;
}

export function VideoList({ list, section }: IProps) {
  const [page, setPage] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [totalList, setTotalList] = useState(list);
  const [loading, setLoading] = useState(false);

  const mapItemsRef = useRef<Map<Element, { index: number }>>(new Map());

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const obj = mapItemsRef.current.get(entry.target);
        if (obj && entry.isIntersecting) {
          setCurrentVideoIndex(obj.index);
        }
      });
    },
    []
  );

  const observer = useMemo<IntersectionObserver | null>(
    () => createObserver(observerCallback),
    [observerCallback]
  );

  const observerRef = useRef<IntersectionObserver>(observer);

  useEffect(() => {
    if (loading === false && currentVideoIndex >= totalList.length - 6) {
      setLoading(true);

      try {
        (async () => {
          if (section !== "self") {
            const { coubs } = await fetch(
              `/api/coubs?section=${section}&page=${page + 1}`
            ).then((res) => res.json());
            setTotalList((prev) => {
              const c: Item[] = [];
              new Map(
                [...prev, ...coubs].map((item) => [item.permalink, item])
              ).forEach((x) => c.push(x));
              return c;
            });
            setPage((p) => ++p);
            setLoading(false);
          } else {
            const { reclips } = await fetch(
              `/api/getReclips?page=${page + 1}`
            ).then((res) => res.json());
            if (reclips.length !== 0) {
              setTotalList((prev) => [...prev, ...reclips]);
              setPage((p) => ++p);
              setLoading(false);
            }
          }
        })();
      } catch (error) {
        setLoading(false);
      }
    }
  }, [totalList.length, currentVideoIndex, loading, page, section]);

  if (totalList == null) return null;

  return (
    <PlayerCore>
      <CurrentVideoIndexContext.Provider value={currentVideoIndex}>
        <div style={{ position: "fixed", top: "20px", left: "20px" }}>
          {page} {currentVideoIndex}
        </div>
        {totalList.map((item, index) => (
          <PlayerContainer
            key={item.permalink}
            data={item}
            index={index}
            isShow={getIsShowPlayer(currentVideoIndex, index)}
            mapItemsRef={mapItemsRef}
            observerRef={observerRef}
          />
        ))}
      </CurrentVideoIndexContext.Provider>
    </PlayerCore>
  );
}

interface IProps {
  list: Item[];
  section: SiteSection;
}
