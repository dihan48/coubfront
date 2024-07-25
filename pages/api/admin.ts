import type { NextApiRequest, NextApiResponse } from "next";
import { fileTypeFromBlob } from "file-type";
import { fetchCoubs } from "@/helpers/fetchApi";
import { createReclip, hasPermalink } from "@/helpers/db";

const token = process.env.DISCORD_TOKEN || "";
const channelId = process.env.DISCORD_CHANNEL || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  if (req.query?.page && req.query?.pageEnd) {
    const { page, pageEnd } = req.query;

    for (let i = +page; i < +pageEnd; i++) {
      const endpoint = `https://coub.com/api/v2/timeline/subscriptions/${
        req.query?.section || "fresh"
      }?page=${i || "1"}`;
      const coubs = await fetchCoubs(endpoint);

      for (const coub of coubs) {
        const { permalink, title } = coub;

        if (!permalink) {
          continue;
        }
        if (await hasPermalink(permalink)) {
          console.log("permalink exist ", permalink);
          continue;
        }

        let audioLink = null,
          videoMedLink = null,
          videoHighLink = null,
          videoHigherLink = null,
          pictureLink = null;

        if (coub.audioMed) {
          audioLink = await fetchFile(coub.audioMed).then((link) =>
            JSON.stringify({ link })
          );
        }
        if (coub.videoMed) {
          videoMedLink = await fetchFile(coub.videoMed).then((link) =>
            JSON.stringify({ link })
          );
        }
        if (coub.videoHigh) {
          videoHighLink = await fetchFile(coub.videoHigh).then((link) =>
            JSON.stringify({ link })
          );
        }
        if (coub.videoHigher) {
          videoHigherLink = await fetchFile(coub.videoHigher).then((link) =>
            JSON.stringify({ link })
          );
        }
        if (coub.picture) {
          pictureLink = await fetchFile(coub.picture).then((link) =>
            JSON.stringify({ link })
          );
        }

        const reclip = {
          permalink,
          title,
          audioLink,
          videoMedLink,
          videoHighLink,
          videoHigherLink,
          pictureLink,
        };

        const r = await createReclip(reclip);
        const d = r?.permalink || "";

        res.write(d + "<br />");
      }
    }
  }

  res.end();
}

async function fetchFile(url: string) {
  return await fetch(url)
    .then((res) => res.blob())
    .then((data) =>
      fileTypeFromBlob(data).then((fileType) => {
        const file = blobToFile(data, Date.now() + "." + fileType?.ext);
        return loadDiscord(file);
      })
    );
}

export async function loadDiscord(file: File): Promise<string | null> {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

  let formData = new FormData();
  formData.append("files[1]", file, file.name);

  const init: RequestInit = {
    headers: {
      Authorization: `Bot ${token}`,
    },
    method: "POST",
    body: formData,
  };

  const results = await fetch(url, init)
    .then((res) => res.json())
    .catch(console.log);

  if (isDiscordError(results)) {
    const error = results as DiscordError;
    console.log({ error });
    await new Promise<void>((r) => {
      setTimeout(() => r(), error.retry_after * 1000 + 1000);
    });
    return await loadDiscord(file);
  }

  const attachment = results?.attachments?.[0];
  if (attachment) {
    const { id, filename } = attachment;
    console.log({ id, filename });
    return `https://cdn.discordapp.com/attachments/1069620008050753566/${id}/${filename}`;
  } else {
    console.log("error attachment", results);
    return null;
  }
}

function blobToFile(theBlob: Blob, fileName: string): File {
  const b: any = theBlob;
  b.lastModifiedDate = new Date();
  b.name = fileName;
  return theBlob as File;
}

type Data = {
  data: string[];
};

type DiscordError = {
  global: boolean;
  message: string;
  retry_after: number;
};

function isDiscordError(o: any): o is DiscordError {
  return "global" in o && "message" in o && "retry_after" in o;
}
