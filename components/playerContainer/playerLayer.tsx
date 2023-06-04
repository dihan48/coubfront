import {
  Dispatch,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { Player } from "../player/player";
import { Item } from "@/pages";
import { PlayerUI } from "../playUI/playerUI";

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

const SetVideoPlayedContext = createContext<Dispatch<SetStateAction<boolean>>>(
  () => null
);

export function useSetVideoPlayed() {
  const context = useContext(SetVideoPlayedContext);
  if (context === undefined) {
    throw new Error(
      "useSetVideoPlayed must be used within a SetVideoPlayedContext.Provider"
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

const SetAudioPlayedContext = createContext<Dispatch<SetStateAction<boolean>>>(
  () => null
);

export function useSetAudioPlayed() {
  const context = useContext(SetAudioPlayedContext);
  if (context === undefined) {
    throw new Error(
      "useSetAudioPlayed must be used within a SetAudioPlayedContext.Provider"
    );
  }
  return context;
}

type IProps = {
  data: Item;
  audioRef: RefObject<HTMLAudioElement>;
  videoRef: RefObject<HTMLVideoElement>;
  index: number;
  currentVideoIndex: number;
  isCentered: boolean;
};

export type IPlayerHandles = {
  play: () => void;
  pause: () => void;
  soundOn: () => void;
};

export function PlayerLayer({
  data,
  audioRef,
  videoRef,
  index,
  currentVideoIndex,
  isCentered,
}: IProps) {
  const [videoPlayed, setVideoPlayed] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(!audioRef.current?.muted);

  const playerHandlesRef = useRef<IPlayerHandles>({
    play: () => null,
    pause: () => null,
    soundOn: () => null,
  });

  return (
    <VideoPlayedContext.Provider value={[videoPlayed, setVideoPlayed]}>
      <AudioPlayedContext.Provider value={[audioPlayed, setAudioPlayed]}>
        <Player
          data={data}
          audioRef={audioRef}
          videoRef={videoRef}
          isCentered={isCentered}
          index={index}
          currentVideoIndex={currentVideoIndex}
          playerHandlesRef={playerHandlesRef}
        />

        <PlayerUI playerHandlesRef={playerHandlesRef} />
      </AudioPlayedContext.Provider>
    </VideoPlayedContext.Provider>
  );
}
