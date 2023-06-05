import type { Item } from "@/pages";
import { Player } from "../player/player";
import { PlayerUI } from "../playUI/playerUI";

export function PlayerLayer({ data, index }: IProps) {
  return (
    <>
      <Player data={data} index={index} />
      <PlayerUI />
    </>
  );
}

interface IProps {
  data: Item;
  index: number;
}
