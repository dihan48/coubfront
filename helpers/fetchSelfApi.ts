import { getPlaiceholder } from "plaiceholder";
import type { Item } from "@/helpers/core";
import { getReclipsDB, IAttributesReclipModel, Reclip } from "./db";

const limit = 10;
const token = process.env.DISCORD_TOKEN || "";

export async function fetchReclip(page: number): Promise<Item[]> {
  console.log({ page });
  console.time("getReclipsDB");
  const resDB = await getReclipsDB(
    page > 0 ? (page - 1) * limit : limit,
    limit
  );
  console.timeEnd("getReclipsDB");
  const packetLinks = new ContainerPacketLinks();
  const mapPreResult = new Map<string, Item>();
  const result: Item[] = [];

  if (Array.isArray(resDB)) {
    for (let i = 0; i < resDB.length; i++) {
      const {
        id,
        permalink,
        title,
        videoMedLink,
        videoHighLink,
        videoHigherLink,
        audioLink,
        pictureLink,
        count,
      } = resDB[i];

      const picture = tryGetActualLink(
        packetLinks,
        id,
        "pictureLink",
        pictureLink
      );
      const audioMed = tryGetActualLink(
        packetLinks,
        id,
        "audioLink",
        audioLink
      );
      const videoMed = tryGetActualLink(
        packetLinks,
        id,
        "videoMedLink",
        videoMedLink
      );
      const videoHigh = tryGetActualLink(
        packetLinks,
        id,
        "videoHighLink",
        videoHighLink
      );
      const videoHigher = tryGetActualLink(
        packetLinks,
        id,
        "videoHigherLink",
        videoHigherLink
      );

      mapPreResult.set(id, {
        id,
        permalink,
        title,
        picture,
        audioMed,
        videoMed,
        videoHigh,
        videoHigher,
        blurDataURL: null,
        count,
      });
    }

    await Promise.all(
      packetLinks.packets.map(async (packet) => {
        return await updatePacketLinks(packet).then((links) => {
          links.forEach(({ link, reclipId, dbProp }) => {
            const reclip = mapPreResult.get(reclipId);
            if (reclip) {
              reclip[dbPropToItemProp(dbProp)] = link.link;
            }
            const json = JSON.stringify(link);
            Reclip.update({ [dbProp]: json }, { where: { id: reclipId } });
          });
        });
      })
    );
  }

  mapPreResult.forEach((reclip) => {
    result.push(reclip);
  });

  return result;
}

interface DiscordLink {
  link: string;
  ex?: string;
  is?: string;
  hm?: string;
}

async function updatePacketLinks(
  packetLinks: {
    link: DiscordLink;
    reclipId: string;
    dbProp: keyof IAttributesReclipModel;
  }[]
): Promise<
  {
    link: DiscordLink;
    reclipId: string;
    dbProp: keyof IAttributesReclipModel;
  }[]
> {
  const attachment_urls = packetLinks.map((x) => x.link.link);
  if (packetLinks.length === 0) {
    return [];
  }
  const linkMap = new Map<
    string,
    {
      link: DiscordLink;
      reclipId: string;
      dbProp: keyof IAttributesReclipModel;
    }
  >();
  packetLinks.forEach((x) => linkMap.set(x.link.link, x));

  console.time("discord api");
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

  data.refreshed_urls?.forEach((x) => {
    let newDiscordLink: DiscordLink | null = null;
    const fullLink = x.refreshed;

    if (typeof fullLink === "string") {
      newDiscordLink = { link: fullLink };
      const url = new URL(fullLink);
      newDiscordLink.ex = url.searchParams.get("ex") || undefined;
      newDiscordLink.is = url.searchParams.get("is") || undefined;
      newDiscordLink.hm = url.searchParams.get("hm") || undefined;
    }

    const discordLink = linkMap.get(x.original);
    if (discordLink && newDiscordLink) {
      discordLink.link = newDiscordLink;
    }
  });

  packetLinks.forEach((x) => {
    if (x.link.ex) {
      if (parseInt(x.link.ex, 16) * 1000 + 60 * 1000 < new Date().getTime()) {
        console.warn("link NOT updated", x.link.link);
      }
    } else {
      console.warn("link NOT updated", x.link.link);
    }
  });

  console.timeEnd("discord api");
  return packetLinks;
}

function tryGetActualLink(
  packetLinks: ContainerPacketLinks,
  reclipId: string,
  dbProp: keyof IAttributesReclipModel,
  json: string | null
): string | null {
  if (!json) {
    return null;
  }

  const link: DiscordLink | null = getJson(json);
  if (link) {
    if (
      !link?.ex ||
      parseInt(link.ex, 16) * 1000 + 60 * 1000 < new Date().getTime()
    ) {
      packetLinks.add(link, reclipId, dbProp);
      return null;
    } else {
      return link.link;
    }
  }

  return null;
}

function getJson(str: string | null) {
  if (!str) {
    return null;
  }
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}

class ContainerPacketLinks {
  lastPacket: {
    link: DiscordLink;
    reclipId: string;
    dbProp: keyof IAttributesReclipModel;
  }[] = [];
  packets: {
    link: DiscordLink;
    reclipId: string;
    dbProp: keyof IAttributesReclipModel;
  }[][] = [this.lastPacket];

  add = (
    link: DiscordLink,
    reclipId: string,
    dbProp: keyof IAttributesReclipModel
  ) => {
    if (this.lastPacket.length < 50) {
      this.lastPacket.push({ link, reclipId, dbProp });
    } else {
      this.lastPacket = [];
      this.packets.push(this.lastPacket);
      this.lastPacket.push({ link, reclipId, dbProp });
    }
  };
}

function dbPropToItemProp(dbProp: string): keyof {
  picture: string;
  audioMed: string;
  videoMed: string;
  videoHigh: string;
  videoHigher: string;
} {
  switch (dbProp) {
    case "pictureLink":
      return "picture";
    case "audioLink":
      return "audioMed";
    case "videoMedLink":
      return "videoMed";
    case "videoHighLink":
      return "videoHigh";
    case "videoHigherLink":
      return "videoHigher";
    default:
      throw new Error(`dbPropToItemProp: ${dbProp} not found`);
  }
}
