import type { NextApiRequest, NextApiResponse } from "next";
import { fileTypeFromBlob } from "file-type";
import { fetchCoubs } from "@/helpers/fetchApi";
import { ICreateReclip, createReclip, hasPermalink } from "@/helpers/db";

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

        let audioMed = null,
          videoMed = null,
          videoHigh = null,
          videoHigher = null,
          picture = null;

        if (coub.audioMed) {
          audioMed = await fetchFile(coub.audioMed);
        }
        if (coub.videoMed) {
          videoMed = await fetchFile(coub.videoMed);
        }
        if (coub.videoHigh) {
          videoHigh = await fetchFile(coub.videoHigh);
        }
        if (coub.videoHigher) {
          videoHigher = await fetchFile(coub.videoHigher);
        }
        if (coub.picture) {
          picture = await fetchFile(coub.picture);
        }

        const reclip: ICreateReclip = {
          permalink,
          title,
          audioMed,
          videoMed,
          videoHigh,
          videoHigher,
          picture,
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
