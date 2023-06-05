import { PlayButton } from "./playButton";
import { SoundButton } from "./soundButton";
import { useAudioPlayed, usePlayerHandles, useVideoPlayed } from "../playerCore/playerCore";

import styles from "./playerUI.module.css";

export function PlayerUI() {
  const [videoPlayed] = useVideoPlayed();
  const [audioPlayed] = useAudioPlayed();

  const playerHandles = usePlayerHandles();

  return (
    <>
      <div
        className={styles.container}
        onClick={() => {
          videoPlayed ? playerHandles.stop() : playerHandles.tryPlay();
        }}
      >
        {videoPlayed === false && <PlayButton />}
      </div>
      {audioPlayed === false && videoPlayed === true && (
        <SoundButton />
      )}
    </>
  );
}
