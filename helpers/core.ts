export function createAudio() {
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

export function createVideo() {
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

export function createObserver(callback: IntersectionObserverCallback) {
  if (typeof document !== "object") return null;

  const options = {
    threshold: 0.75,
  };

  return new IntersectionObserver(callback, options);
}

export function getIsShowPlayer(c: number, i: number) {
  return c - 2 < i && c + 2 > i;
}

export type Item = {
  permalink: string | null;
  videoMed: string | null;
  videoHigh: string | null;
  videoHigher: string | null;
  audioMed: string | null;
  title: string | null;
  picture: string | null;
  blurDataURL: string | null;
};

export type SiteSection = "daily" | "rising" | "fresh" | "self";
