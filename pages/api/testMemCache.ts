import type { NextApiRequest, NextApiResponse } from "next";
const data = {
  time: new Date(),
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (data.time.getTime() < new Date().getTime() - 10 * 1000) {
    data.time = new Date();
  }

  res.status(200).json(data);
}

type Data = {
  time: Date;
};
