// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import type { Item } from "..";
import { getPlaiceholder } from "plaiceholder";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const coubs = await fetch(
    `https://coub.com/api/v2/timeline/subscriptions/fresh?page=${req.query?.page}`
  )
    .then((res) => res.json())
    .then(
      async (data) =>
        await Promise.all(
          data.coubs.map(async (item: any): Promise<Item> => {
            const b = await fetch(item.picture)
              .then((res) => res.arrayBuffer())
              .then((arrayBuffer) => Buffer.from(arrayBuffer))
              .catch(() => null);

            const { base64 } = b
              ? await getPlaiceholder(b).catch(() => ({
                  base64: null,
                }))
              : {
                  base64: null,
                };

            return {
              permalink: item?.permalink || null,
              videoMed: item?.file_versions?.html5?.video?.med || null,
              videoHigh: item?.file_versions?.html5?.video?.high || null,
              videoHigher: item?.file_versions?.html5?.video?.higher || null,
              audioMed: item?.file_versions?.html5?.audio?.med || null,
              title: item?.title || null,
              picture: item?.picture || null,
              blurDataURL: base64 || null,
            };
          })
        ).then((values) => values)
    );

  res.status(200).json({ coubs });
}

type Data = {
  coubs: Item[];
};
