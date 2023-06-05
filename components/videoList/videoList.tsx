import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PlayerContainer } from "../playerContainer/playerContainer";
import { Item } from "@/pages";
import {
  createAudio,
  createObserver,
  createVideo,
  getIsShowPlayer,
} from "@/helpers/core";

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

const VideoPlayedContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => null]);

export function useVideoPlayed() {
  const context = useContext(VideoPlayedContext);
  if (context === undefined) {
    throw new Error(
      "useVideoPlayed must be used within a VideoPlayedContext.Provider"
    );
  }
  return context;
}

const AudioPlayedContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => null]);

export function useAudioPlayed() {
  const context = useContext(AudioPlayedContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayed must be used within a AudioPlayedContext.Provider"
    );
  }
  return context;
}

export function VideoList({ list }: { list: Item[] }) {
  const [page, setPage] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [totalList, setTotalList] = useState(list);
  const [loading, setLoading] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(true);

  const audio = useMemo<HTMLAudioElement | null>(createAudio, []);
  const video = useMemo<HTMLVideoElement | null>(createVideo, []);

  const audioRef = useRef<HTMLAudioElement | null>(audio);
  const videoRef = useRef<HTMLVideoElement | null>(video);

  const mapItemsRef = useRef<Map<Element, { index: number }>>(new Map());

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const obj = mapItemsRef.current.get(entry.target);
      if (obj && entry.isIntersecting) {
        setCurrentVideoIndex(obj.index);
      }
    });
  }, []);

  const observer = useMemo<IntersectionObserver | null>(
    () => createObserver(callback),
    [callback]
  );

  const observerRef = useRef<IntersectionObserver>(observer);

  useEffect(() => {
    if (audioRef.current) document.body.append(audioRef.current);
  }, []);

  useEffect(() => {
    if (loading === false && currentVideoIndex >= totalList.length - 6) {
      setLoading(true);

      try {
        (async () => {
          const { coubs } = await fetch(`/api/hello?page=${page + 1}`).then(
            (res) => res.json()
          );
          setTotalList((prev) => {
            const c: Item[] = [];
            new Map(
              [...prev, ...coubs].map((item) => [item.permalink, item])
            ).forEach((x) => c.push(x));
            return c;
          });
          setPage((p) => ++p);
          setLoading(false);
        })();
      } catch (error) {
        setLoading(false);
      }
    }
  }, [totalList.length, currentVideoIndex, loading, page]);

  if (totalList == null) return null;

  return (
    <VideoPlayedContext.Provider value={[videoPlayed, setVideoPlayed]}>
      <AudioPlayedContext.Provider value={[audioPlayed, setAudioPlayed]}>
        <CurrentVideoIndexContext.Provider value={currentVideoIndex}>
          <div style={{ position: "fixed", top: "20px", left: "20px" }}>
            {page} {currentVideoIndex}
          </div>
          {totalList.map((item, index) => (
            <PlayerContainer
              key={item.permalink}
              data={item}
              audioRef={audioRef}
              videoRef={videoRef}
              index={index}
              isShow={getIsShowPlayer(currentVideoIndex, index)}
              mapItemsRef={mapItemsRef}
              observerRef={observerRef}
            />
          ))}
        </CurrentVideoIndexContext.Provider>
      </AudioPlayedContext.Provider>
    </VideoPlayedContext.Provider>
  );
}
