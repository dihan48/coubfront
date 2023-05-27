import { useEffect, useRef, useState } from "react";
import { PlayerContainer } from "../playerContainer/playerContainer";
import { Item } from "@/pages";

export function VideoList({ list }: { list: Item[] }) {
  const [page, setPage] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [totalList, setTotalList] = useState(list);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  if (totalList == null) return null;

  return (
    <>
      <div style={{ position: "fixed", top: "20px", left: "20px" }}>{page} {currentVideoIndex}</div>
      <audio
        hidden
        controls={true}
        src=""
        preload="auto"
        muted={false}
        loop={true}
        ref={audioRef}
        autoPlay={false}
      />
      {totalList.map((item, index) => (
        <PlayerContainer
          key={item.permalink}
          data={item}
          audioRef={audioRef}
          index={index}
          page={page}
          setPage={(index >= totalList.length - 6) && loading === false ? setPage : null}
          setCurrentVideoIndex={setCurrentVideoIndex}
          isShow={getIsShowPlayer(currentVideoIndex, index)}
        />
      ))}
    </>
  );
}

function getIsShowPlayer(c: number, i: number) {
  return (c - 2) < i && (c + 2) > i
}