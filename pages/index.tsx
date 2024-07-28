import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import type { NextPageWithLayout } from "./_app";
import type { Item, SiteSection } from "@/helpers/core";
import { ReactElement } from "react";
import Layout from "@/components/layouts/main";
import { VideoList } from "@/components/videoList/videoList";
import { fetchReclip } from "@/helpers/fetchSelfApi";

const section: SiteSection = "self";

const Page: NextPageWithLayout<IPageProps> = ({ reclips }) => {
  return <VideoList list={reclips} section={section} />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

let reclips: Item[] = [];
let lastUpdate: number = 0;

export const getServerSideProps = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  try {
    if (req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, "secret");
        if (decoded) {
          const { id } = decoded as { id: string };

          if (id) {
            const reclips = await fetchReclip(1, id);
            return { props: { reclips } };
          }
        }
      } catch (error) {}
    } else {
      if (Date.now() - lastUpdate > 1000 * 10) {
        lastUpdate = Date.now();
        reclips = await fetchReclip(1);
      }

      return { props: { reclips } };
    }
  } catch (error) {
    console.log(error);
  }
};

interface IPageProps {
  reclips: Array<Item>;
}

export default Page;
