import type { NextApiRequest, NextApiResponse } from "next";
import type { NextPageWithLayout } from "../_app";
import { ReactElement } from "react";
import Layout from "@/components/layouts/main";
import { base62ToDecimal } from "@/helpers/utils";
import { PlayerCore } from "@/components/playerCore/playerCore";
import { Item } from "@/helpers/core";
import { fetchReclipFromId } from "@/helpers/fetchSelfApi";
import { PlayerLayer } from "@/components/playerContainer/playerLayer";
import Head from "next/head";

const Page: NextPageWithLayout<IPageProps> = ({ data, id }) => {
  console.log(data.picture);
  return (
    <PlayerCore>
      <>
        <Head>
          <meta property="og:url" content={`https://cyclip.com/view/${id}`} />
          <meta property="og:title" content="og title" />
          <meta property="og:description" content="og description" />
          <meta property="og:site_name" content="Cyclip" />

          {/* <meta property="og:image" content={`${data.picture}` || ""} />
          <meta property="og:image:width" content="480" />
          <meta property="og:image:height" content="480" />
          <meta property="og:image:url" content={`${data.picture}` || ""} />
          <meta property="og:image:type" content="image/jpeg" /> */}

          {/* <meta property="og:video:width" content="960" />
          <meta property="og:video:height" content="960" />
          <meta property="og:video:type" content="text/html" />
          <meta
            property="og:video:url"
            content={`https://cyclip.com/view/${id}`}
          />
          <meta
            property="og:video:secure_url"
            content={`https://cyclip.com/view/${id}`}
          />
          <meta property="og:type" content="video.other" /> */}

          <meta
            property="og:video"
            content={
              encodeURI(`https://cyclip.com/api/t?url=${data.videoMed}`) || ""
            }
          />
          <meta
            property="og:video:secure_url"
            content={
              encodeURI(`https://cyclip.com/api/t?url=${data.videoMed}`) || ""
            }
          />
          <meta property="og:video:type" content="video/mp4" />
          <meta property="og:video:width" content="400" />
          <meta property="og:video:height" content="300" />
        </Head>
        <PlayerLayer data={data} index={0} />
      </>
    </PlayerCore>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = async ({
  params,
}: {
  params: { id: string };
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  const id = params.id;

  const videoId = base62ToDecimal(id);
  const data = await fetchReclipFromId(videoId);

  if (!data) {
    // return {
    //   notFound: true,
    // };

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { data, id },
  };
};

interface IPageProps {
  data: Item;
  id: string;
}

export default Page;
