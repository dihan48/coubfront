"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlayerContainer } from "../player/player";

export function VideoList(prop) {
  const [totalList, setTotalList] = useState([]);
  const audioRef = useRef();
  const pageRef = useRef(2);

  const list = prop?.list;

  const allList = [...list, ...totalList];

  const callback = useCallback(() => {
    fetch(`/api?page=${pageRef.current}`)
      .then((res) => res.json())
      .then((data) => {
        setTotalList((list) => {
          return [
            ...list,
            ...data.coubs.map((item) => {
              const newItem = {};

              newItem.permalink = item.permalink;
              newItem.videoMed = item.file_versions?.html5?.video?.med;
              newItem.videoHigh = item.file_versions?.html5?.video?.high;
              newItem.videoHigher = item.file_versions?.html5?.video?.higher;
              newItem.audioMed = item.file_versions?.html5?.audio?.med;
              newItem.title = item?.title;
              newItem.picture = item?.picture;

              return newItem;
            }),
          ];
        });
      });
    pageRef.current++;
  }, []);

  if (list == null) return null;

  return (
    <>
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
      {allList.map((item, index) => (
        <PlayerContainer
          key={item.permalink}
          data={item}
          audioRef={audioRef}
          callback={index === allList.length - 1 ? callback : null}
        />
      ))}
    </>
  );
}
