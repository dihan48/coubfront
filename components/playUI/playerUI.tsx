import { MutableRefObject } from "react";
import { IPlayerHandles } from "../playerContainer/playerContainer";
import { useAudioPlayed, useVideoPlayed } from "../playerContainer/playerLayer";
import { PlayButton } from "./playButton";
import { SoundButton } from "./soundButton";

import styles from "./playerUI.module.css";

export function PlayerUI({
  playerHandlesRef,
}: {
  playerHandlesRef: MutableRefObject<IPlayerHandles>;
}) {
  const [videoPlayed] = useVideoPlayed();
  const [audioPlayed] = useAudioPlayed();

  return (
    <>
      <div
        className={styles.container}
        onClick={() => {
          videoPlayed
            ? playerHandlesRef.current.pause()
            : playerHandlesRef.current.play();
        }}
      >
        {videoPlayed === false && <PlayButton />}
      </div>
      {audioPlayed === false && videoPlayed === true && (
        <SoundButton playerHandlesRef={playerHandlesRef} />
      )}
    </>
  );
}
