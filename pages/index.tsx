import type { NextPageWithLayout } from "./_app";
import type { Item, SiteSection } from "@/helpers/core";
import { ReactElement } from "react";
import Layout from "@/components/layouts/main";
import { VideoList } from "@/components/videoList/videoList";
import { fetchCoubs } from "@/helpers/fetchApi";

const section: SiteSection = "fresh";
const endpoint = `https://coub.com/api/v2/timeline/subscriptions/${section}?page=1`;

const Page: NextPageWithLayout<IPageProps> = ({ coubs }) => {
  return <VideoList list={coubs} section={section} />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getStaticProps = async () => {
  const coubs = await fetchCoubs(endpoint);

  return {
    props: { coubs },
    revalidate: 10,
  };
};

interface IPageProps {
  coubs: Array<Item>;
}

export default Page;
