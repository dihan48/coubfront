import type { Item } from "@/helpers/core";
import { getPlaiceholder } from "plaiceholder";

export async function fetchCoubs(endpoint: string): Promise<Item[]> {
  const coubs = await fetch(endpoint)
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
              videoMed: item?.file_versions?.html5?.video?.med?.url || null,
              videoHigh: item?.file_versions?.html5?.video?.high?.url || null,
              videoHigher:
                item?.file_versions?.html5?.video?.higher?.url || null,
              audioMed: item?.file_versions?.html5?.audio?.med?.url || null,
              title: item?.title || null,
              picture: item?.picture || null,
              blurDataURL: base64 || null,
            };
          })
        ).then((values) => values)
    );

  return coubs;
}
