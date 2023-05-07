import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (<ClerkProvider {...pageProps} >
          <Head>
        <title>bird</title>
        <meta name="description" content="bird" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    <Toaster></Toaster>
<Component {...pageProps} />
  </ClerkProvider>)

}

export default api.withTRPC(MyApp);
