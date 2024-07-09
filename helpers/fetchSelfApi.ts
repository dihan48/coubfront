import { getPlaiceholder } from "plaiceholder";
import type { Item } from "@/helpers/core";
import { getReclipsDB } from "./db";

const limit = 10;
const token = process.env.DISCORD_TOKEN || "";

export async function fetchReclip(page: number): Promise<Item[]> {
  const resDB = await getReclipsDB(
    page > 0 ? (page - 1) * limit : limit,
    limit
  );

  if (Array.isArray(resDB)) {
    const reclip = await Promise.all(
      resDB.map(async (reclip): Promise<Item> => {
        let base64 = null;
        let newVideoMedUrl = null;
        let newVideoHighUrl = null;
        let newVideoHigherUrl = null;
        let newAudioUrl = null;
        let newPictureUrl = null;

        const pictureUrl = reclip.picture?.picture;
        const videoMedUrl = reclip.video?.videoMed;
        const videoHighUrl = reclip.video?.videoHigh;
        const videoHigherUrl = reclip.video?.videoHigher;
        const audioUrl = reclip.audio?.audioMed;

        const attachment_urls = [
          pictureUrl,
          videoMedUrl,
          videoHighUrl,
          videoHigherUrl,
          audioUrl,
        ];

        if (reclip.picture?.picture) {
          const response = await fetch(
            `https://discord.com/api/v9/attachments/refresh-urls`,
            {
              method: "POST",
              headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                attachment_urls,
              }),
            }
          );

          const data: {
            refreshed_urls: {
              refreshed: string;
              original: string;
            }[];
          } = await response.json();

          if (pictureUrl && pictureUrl.length > 0) {
            newPictureUrl =
              (reclip.picture?.picture &&
                data.refreshed_urls.find((x) => x.original === pictureUrl)
                  ?.refreshed) ||
              null;

            if (newPictureUrl && newPictureUrl.length > 0) {
              const b = await fetch(newPictureUrl)
                .then((res) => res.arrayBuffer())
                .then((arrayBuffer) => Buffer.from(arrayBuffer))
                .catch(() => null);

              const ph = b ? await getPlaiceholder(b) : null;
              if (ph?.base64) {
                base64 = ph.base64;
              }
            }
          }

          if (videoMedUrl && videoMedUrl.length > 0) {
            newVideoMedUrl =
              (reclip.video?.videoMed &&
                data.refreshed_urls.find((x) => x.original === videoMedUrl)
                  ?.refreshed) ||
              null;
          }

          if (videoHighUrl && videoHighUrl.length > 0) {
            newVideoHighUrl =
              (reclip.video?.videoHigh &&
                data.refreshed_urls.find((x) => x.original === videoHighUrl)
                  ?.refreshed) ||
              null;
          }

          if (videoHigherUrl && videoHigherUrl.length > 0) {
            newVideoHigherUrl =
              (reclip.video?.videoHigher &&
                data.refreshed_urls.find((x) => x.original === videoHigherUrl)
                  ?.refreshed) ||
              null;
          }

          if (audioUrl && audioUrl.length > 0) {
            newAudioUrl =
              (reclip.audio?.audioMed &&
                data.refreshed_urls.find((x) => x.original === audioUrl)
                  ?.refreshed) ||
              null;
          }
        }

        return {
          permalink: reclip.permalink,
          videoMed: newVideoMedUrl,
          videoHigh: newVideoHighUrl,
          videoHigher: newVideoHigherUrl,
          audioMed: newAudioUrl,
          title: reclip.title,
          picture: newPictureUrl,
          blurDataURL: base64,
        };
      })
    ).then((values) => values);

    return reclip;
  }

  return [];
}
