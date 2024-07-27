import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import type { Item } from "@/helpers/core";
import { fetchReclip } from "@/helpers/fetchSelfApi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const page = req.query?.page;

  if (req.cookies?.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, "secret");
      // console.log({ decoded });
      if (decoded) {
        const { id } = decoded as { id: string };

        if (id) {
          const reclips = await fetchReclip(
            typeof page === "string" ? parseInt(page) : 1,
            id
          );
          res.status(200).json({ reclips });
        }
      }
    } catch (error) {}
  } else {
    const reclips = await fetchReclip(
      typeof page === "string" ? parseInt(page) : 1
    );
    res.status(200).json({ reclips });
  }
}

type Data = {
  reclips: Item[];
};
