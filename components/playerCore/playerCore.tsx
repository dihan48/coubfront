import type { Item } from "@/pages";
import type { Dispatch, ReactElement, RefObject, SetStateAction } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createAudio, createVideo } from "@/helpers/core";

const VideoPlayedContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => null]);

const AudioPlayedContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => null]);

const PlayerHandlesContext = createContext<PlayerHandles>({
  tryPlay: () => void 0,
  stop: () => void 0,
  soundOn: () => void 0,
  setupPlayer: () => void 0,
});

export function PlayerCore({ children }: { children: ReactElement }) {
  const [videoPlayed, setVideoPlayed] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(true);

  const audio = useMemo<HTMLAudioElement | null>(createAudio, []);
  const video = useMemo<HTMLVideoElement | null>(createVideo, []);

  const audioRef = useRef<HTMLAudioElement | null>(audio);
  const videoRef = useRef<HTMLVideoElement | null>(video);

  const audioCanPlayRef = useRef(false);
  const videoCanPlayRef = useRef(false);

  const tryPlay = useCallback(function () {
    const audio = audioRef.current;
    const video = videoRef.current;

    if (audio && video && audioCanPlayRef.current && videoCanPlayRef.current) {
      Promise.all([
        audio
          .play()
          .then(() => true)
          .catch(() => false),
        video
          .play()
          .then(() => true)
          .catch(() => false),
      ]).then((values) => {
        const [audioPlay, videoPlay] = values;

        if (audioPlay === false && videoPlay === false) {
          setVideoPlayed(false);
        }

        if (audioPlay === false && videoPlay === true) {
          setAudioPlayed(false);
          setVideoPlayed(true);

          audio.muted = true;
        }

        if (audioPlay === true && videoPlay === true) {
          setVideoPlayed(true);
        }
      });
    }
  }, []);

  const stop = useCallback(function () {
    const audio = audioRef.current;
    const video = videoRef.current;

    if (audio && video) {
      video.pause();
      video.currentTime = 0;

      audio.pause();
      audio.currentTime = 0;

      setVideoPlayed(false);
    }
  }, []);

  const soundOn = useCallback(function () {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (audio && video) {
      audio.muted = false;

      audio.play().then(() => {
        audio.currentTime = video.currentTime;
        setAudioPlayed(true);
      });
    }
  }, []);

  const setupPlayer = useCallback(
    function (playerRef: RefObject<HTMLDivElement>, data: Item) {
      const audio = audioRef.current;
      const video = videoRef.current;
      const player = playerRef.current;

      if (audio && video && player) {
        player.append(video);

        const { audioMed, picture } = data;

        audio.src = audioMed?.url || "";
        video.src = getVideoSrc(data);
        video.poster = picture || "";

        video.load();
        audio.load();

        const audioCanPlay = () => {
          audio.removeEventListener("canplay", audioCanPlay);
          audioCanPlayRef.current = true;
          tryPlay();
        };

        const videoCanPlay = () => {
          video.removeEventListener("canplay", videoCanPlay);
          videoCanPlayRef.current = true;
          tryPlay();
        };

        audio.addEventListener("canplay", audioCanPlay);
        video.addEventListener("canplay", videoCanPlay);

        return () => {
          audio.removeEventListener("canplay", audioCanPlay);
          video.removeEventListener("canplay", videoCanPlay);
        };
      }
    },
    [tryPlay]
  );

  useEffect(() => {
    if (audioRef.current) document.body.append(audioRef.current);
  }, []);

  const playerHandles = useMemo(
    () => ({ tryPlay, stop, soundOn, setupPlayer }),
    [tryPlay, stop, soundOn, setupPlayer]
  );

  return (
    <PlayerHandlesContext.Provider value={playerHandles}>
      <VideoPlayedContext.Provider value={[videoPlayed, setVideoPlayed]}>
        <AudioPlayedContext.Provider value={[audioPlayed, setAudioPlayed]}>
          {children}
        </AudioPlayedContext.Provider>
      </VideoPlayedContext.Provider>
    </PlayerHandlesContext.Provider>
  );
}

export type PlayerHandles = {
  tryPlay: () => void;
  stop: () => void;
  soundOn: () => void;
  setupPlayer: (playerRef: RefObject<HTMLDivElement>, data: Item) => void;
};

export function getVideoSrc(data: Item) {
  const { videoMed, videoHigh, videoHigher } = data;

  const winWidth = typeof window === "object" ? window.innerWidth : 0;

  let videoSrc = videoMed?.url || "";
  if (winWidth >= 1200 && winWidth < 1560) {
    videoSrc = videoHigh?.url || videoMed?.url || "";
  }

  if (winWidth >= 1560) {
    videoSrc = videoHigher?.url || videoMed?.url || "";
  }

  return videoSrc;
}

export function useVideoPlayed() {
  const context = useContext(VideoPlayedContext);
  if (context === undefined) {
    throw new Error(
      "useVideoPlayed must be used within a VideoPlayedContext.Provider"
    );
  }
  return context;
}

export function useAudioPlayed() {
  const context = useContext(AudioPlayedContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayed must be used within a AudioPlayedContext.Provider"
    );
  }
  return context;
}

export function usePlayerHandles() {
  const context = useContext(PlayerHandlesContext);
  if (context === undefined) {
    throw new Error(
      "usePlayerHandles must be used within a PlayerHandlesContext.Provider"
    );
  }
  return context;
}
