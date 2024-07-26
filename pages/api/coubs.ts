import type { Item } from "@/helpers/core";
import { fetchCoubs } from "@/helpers/fetchApi";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const coubs = await fetchCoubs(
    `https://coub.com/api/v2/timeline/subscriptions/${req.query?.section}?page=${req.query?.page}`
  );

  res.status(200).json({ coubs });
}

type Data = {
  coubs: Item[];
};
