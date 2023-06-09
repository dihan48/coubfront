import { getPlaiceholder } from "plaiceholder";
import type { Item } from "@/helpers/core";
import { getReclipsDB } from "./db";

const limit = 10;

export async function fetchReclip(page: number): Promise<Item[]> {
  const resDB = await getReclipsDB(
    page > 0 ? (page - 1) * limit : limit,
    limit
  );

  if (Array.isArray(resDB)) {
    const reclip = await Promise.all(
      resDB.map(async (reclip): Promise<Item> => {
        let base64 = null;

        if (reclip.picture?.picture) {
          const b = await fetch(reclip.picture?.picture)
            .then((res) => res.arrayBuffer())
            .then((arrayBuffer) => Buffer.from(arrayBuffer))
            .catch(() => null);

          const ph = b ? await getPlaiceholder(b) : null;
          if (ph?.base64) {
            base64 = ph.base64;
          }
        }

        return {
          permalink: reclip.permalink,
          videoMed: reclip.video?.videoMed || null,
          videoHigh: reclip.video?.videoHigh || null,
          videoHigher: reclip.video?.videoHigher || null,
          audioMed: reclip.audio?.audioMed || null,
          title: reclip.title,
          picture: reclip.picture?.picture || null,
          blurDataURL: base64,
        };
      })
    ).then((values) => values);

    return reclip;
  }

  return [];
}
