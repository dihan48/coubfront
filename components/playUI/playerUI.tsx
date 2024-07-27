import { PlayButton } from "./playButton";
import { SoundButton } from "./soundButton";
import {
  useAudioPlayed,
  usePlayerHandles,
  useVideoPlayed,
} from "../playerCore/playerCore";

import styles from "./playerUI.module.css";

export function PlayerUI({ count }: IProps) {
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
        {count != null && <div className={styles.count}>👁 {count}</div>}
        {videoPlayed === false && <PlayButton />}
      </div>
      {audioPlayed === false && videoPlayed === true && <SoundButton />}
    </>
  );
}

interface IProps {
  count?: number;
}
