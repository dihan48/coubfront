import type { Item } from "@/helpers/core";
import { Player } from "../player/player";

export function PlayerLayer({ data, index }: IProps) {
  return <Player data={data} index={index} />;
}

interface IProps {
  data: Item;
  index: number;
}
