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

export const getServerSideProps = async ({ req }: { req: NextApiRequest }) => {
  let reclips: Item[] = [];

  try {
    if (req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, "secret");
        // console.log({ decoded });
        if (decoded) {
          const { id } = decoded as { id: string };

          if (id) {
            reclips = await fetchReclip(1, id);
          }
        }
      } catch (error) {}
    } else {
      reclips = await fetchReclip(1);
    }
  } catch (error) {
    console.log(error);
  }

  return { props: { reclips } };
};

interface IPageProps {
  reclips: Array<Item>;
}

export default Page;
