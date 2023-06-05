import { RefObject, useRef } from "react";
import { Player } from "../player/player";
import { Item } from "@/pages";
import { PlayerUI } from "../playUI/playerUI";

type IProps = {
  data: Item;
  audioRef: RefObject<HTMLAudioElement>;
  videoRef: RefObject<HTMLVideoElement>;
  index: number;
};

export type IPlayerHandles = {
  play: () => void;
  pause: () => void;
  soundOn: () => void;
};

export function PlayerLayer({ data, audioRef, videoRef, index }: IProps) {
  const playerHandlesRef = useRef<IPlayerHandles>({
    play: () => null,
    pause: () => null,
    soundOn: () => null,
  });

  return (
    <>
      <Player
        data={data}
        audioRef={audioRef}
        videoRef={videoRef}
        index={index}
        playerHandlesRef={playerHandlesRef}
      />

      <PlayerUI playerHandlesRef={playerHandlesRef} />
    </>
  );
}
