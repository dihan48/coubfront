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

export const getStaticProps = async () => {
  let reclips: Item[] = [];
  try {
    reclips = await fetchReclip(1);
  } catch (error) {
    console.log(error);
  }
  return {
    props: { reclips },
    revalidate: 10,
  };
};

interface IPageProps {
  reclips: Array<Item>;
}

export default Page;
