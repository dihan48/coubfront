import { useEffect, useRef, useState } from "react";
import { PlayerContainer } from "../playerContainer/playerContainer";
import { Item } from "@/pages";

export function VideoList({ list }: { list: Item[] }) {
  const [page, setPage] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [totalList, setTotalList] = useState(list);
  const [loading, setLoading] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (page !== 1) {
      setLoading(true);

      try {
        (async () => {
          const { coubs } = await fetch(`/api/hello?page=${page}`).then(res => res.json())
          setTotalList((prev) => {
            const c: Item[] = [];
            new Map([...prev, ...coubs].map(item => [item.permalink, item])).forEach(x => c.push(x))
            return c;
          });
          setLoading(false);
        })()
      } catch (error) {
        setLoading(false);
      }
    }
  }, [page])

  useEffect(() => {
    if (videoRef.current) return; // bypassing the strict mode double useEffect
    if (audioRef.current) return; // bypassing the strict mode double useEffect

    const audio = document.createElement("audio");
    audio.src = "";
    audio.controls = false;
    audio.preload = "auto";
    audio.muted = false;
    audio.loop = true;
    audio.autoplay = false;
    document.body.append(audio);
    audioRef.current = audio;

    const video = document.createElement("video");
    video.src = "";
    video.controls = false;
    video.preload = "auto";
    video.muted = true;
    video.loop = true;
    video.autoplay = false;

    // document.body.append(video);
    videoRef.current = video;

    video.style.width = "100%";
    video.style.height = "100%";
    video.style.maxWidth = "100%";
    video.style.maxHeight = "100%";

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    video.addEventListener("canplay", () => {
      console.log(`canplay: ${video.src}`);
    });

    audio.setAttribute("muted", "");
    audio.setAttribute("playsinline", "");
    audio.volume = 0.05;

    console.log(video);



    return () => {
      audio.remove();
      video.remove();
    }
  }, [])

  if (totalList == null) return null;

  return (
    <>
      <div style={{ position: "fixed", top: "20px", left: "20px" }}>{page} {currentVideoIndex}</div>
      {totalList.map((item, index) => (
        <PlayerContainer
          key={item.permalink}
          data={item}
          audioRef={audioRef}
          videoRef={videoRef}
          index={index}
          page={page}
          setPage={(index >= totalList.length - 6) && loading === false ? setPage : null}
          setCurrentVideoIndex={setCurrentVideoIndex}
          isShow={getIsShowPlayer(currentVideoIndex, index)}
          isInteracted={isInteracted}
          setIsInteracted={setIsInteracted}
          currentVideoIndex={currentVideoIndex}
        />
      ))}
    </>
  );
}

function getIsShowPlayer(c: number, i: number) {
  return (c - 2) < i && (c + 2) > i
}