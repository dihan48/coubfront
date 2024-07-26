import type { NextApiRequest, NextApiResponse } from "next";
import type { Item } from "@/helpers/core";
import { fetchReclip } from "@/helpers/fetchSelfApi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const page = req.query?.page;
  const reclips = await fetchReclip(
    typeof page === "string" ? parseInt(page) : 1
  );
  res.status(200).json({ reclips });
}

type Data = {
  reclips: Item[];
};
