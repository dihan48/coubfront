import { Player } from "../player/player";
import { Item } from "@/pages";
import { PlayerUI } from "../playUI/playerUI";

type IProps = {
  data: Item;
  index: number;
};

export function PlayerLayer({ data, index }: IProps) {
  return (
    <>
      <Player data={data} index={index} />
      <PlayerUI />
    </>
  );
}
