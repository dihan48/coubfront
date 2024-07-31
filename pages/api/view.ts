import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { addView } from "@/helpers/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const videoId = req.body?.videoId;

  if (videoId && req.cookies?.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, "secret");
      // console.log({ decoded });
      if (decoded) {
        const { id } = decoded as { id: string };

        if (id) {
          const view = await addView(videoId, id);
          console.log(view.createdAt);
        }
      }
    } catch (error) {}
  }
  res.status(200).end();
}
