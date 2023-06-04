import {
  Dispatch,
  SetStateAction,
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

const IsInteractedContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => null]);

export function useIsInteracted() {
  const context = useContext(IsInteractedContext);
  if (context === undefined) {
    throw new Error(
      "useIsInteracted must be used within a IsInteractedContext.Provider"
    );
  }
  return context;
}

const SetIsInteractedContext = createContext<Dispatch<SetStateAction<boolean>>>(
  () => null
);

export function useSetIsInteracted() {
  const context = useContext(SetIsInteractedContext);
  if (context === undefined) {
    throw new Error(
      "useSetIsInteracted must be used within a SetIsInteractedContext.Provider"
    );
  }
  return context;
}

export function VideoList({ list }: { list: Item[] }) {
  const [page, setPage] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [totalList, setTotalList] = useState(list);
  const [loading, setLoading] = useState(false);
  const [isInteracted, setIsInteracted] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useLayoutEffect(() => {
    if (videoRef.current) return; // bypassing the strict mode double useEffect
    if (audioRef.current) return; // bypassing the strict mode double useEffect

    const audio = document.createElement("audio");
    audio.src = "";
    audio.controls = true;
    audio.preload = "auto";
    audio.muted = false;
    audio.loop = true;
    audio.autoplay = false;
    audio.setAttribute("muted", "");
    // audio.setAttribute("playsinline", "");
    audio.volume = 0.05;

    audio.style.position = "fixed";
    audio.style.top = "auto";
    audio.style.bottom = "100px";
    audio.style.zIndex = "100";

    document.body.append(audio);

    audioRef.current = audio;

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

    videoRef.current = video;

    return () => {
      // audio.remove();
      // video.remove();
    };
  }, []);

  useEffect(() => {
    if (page !== 1) {
      setLoading(true);

      try {
        (async () => {
          const { coubs } = await fetch(`/api/hello?page=${page}`).then((res) =>
            res.json()
          );
          setTotalList((prev) => {
            const c: Item[] = [];
            new Map(
              [...prev, ...coubs].map((item) => [item.permalink, item])
            ).forEach((x) => c.push(x));
            return c;
          });
          setLoading(false);
        })();
      } catch (error) {
        setLoading(false);
      }
    }
  }, [page]);

  const value = useMemo<[boolean, Dispatch<SetStateAction<boolean>>]>(
    () => [isInteracted, setIsInteracted],
    [isInteracted, setIsInteracted]
  );

  if (totalList == null) return null;

  return (
    <SetIsInteractedContext.Provider value={setIsInteracted}>
      <IsInteractedContext.Provider value={value}>
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
            page={page}
            setPage={
              index >= totalList.length - 6 && loading === false
                ? setPage
                : null
            }
            setCurrentVideoIndex={setCurrentVideoIndex}
            isShow={getIsShowPlayer(currentVideoIndex, index)}
            currentVideoIndex={currentVideoIndex}
          />
        ))}
      </IsInteractedContext.Provider>
    </SetIsInteractedContext.Provider>
  );
}

function getIsShowPlayer(c: number, i: number) {
  return c - 2 < i && c + 2 > i;
}
