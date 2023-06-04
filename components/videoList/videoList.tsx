import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PlayerContainer } from "../playerContainer/playerContainer";
import { Item } from "@/pages";

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

function createAudio() {
  if (typeof document !== "object") return null;

  const audio = document.createElement("audio");
  audio.src = "";
  audio.controls = false;
  audio.hidden = true;
  audio.preload = "auto";
  audio.muted = false;
  audio.loop = true;
  audio.autoplay = false;
  audio.setAttribute("muted", "");
  audio.volume = 0.05;

  return audio;
}

function createVideo() {
  if (typeof document !== "object") return null;

  const video = document.createElement("video");
  video.src = "";
  video.controls = false;
  video.preload = "auto";
  video.muted = true;
  video.loop = true;
  video.autoplay = false;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  video.style.width = "100%";
  video.style.height = "100%";
  video.style.maxWidth = "100%";
  video.style.maxHeight = "100%";

  return video;
}

export function VideoList({ list }: { list: Item[] }) {
  const [page, setPage] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [totalList, setTotalList] = useState(list);
  const [loading, setLoading] = useState(false);

  const audio = useMemo<HTMLAudioElement | null>(createAudio, []);
  const video = useMemo<HTMLVideoElement | null>(createVideo, []);

  const audioRef = useRef<HTMLAudioElement | null>(audio);
  const videoRef = useRef<HTMLVideoElement | null>(video);

  const mapItemsRef = useRef<Map<Element, { index: number }>>(new Map());
  const observerRef = useRef<IntersectionObserver>();

  useLayoutEffect(() => {
    const options = {
      threshold: 0.75,
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const obj = mapItemsRef.current.get(entry.target);
        if (obj && entry.isIntersecting) {
          setCurrentVideoIndex(obj.index);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, []);

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
  );
}

function getIsShowPlayer(c: number, i: number) {
  return c - 2 < i && c + 2 > i;
}
