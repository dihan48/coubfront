import type { ReactElement } from "react";
import { createContext, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar/navbar";

import styles from "@/styles/Home.module.css";
import Cookies from "js-cookie";

const inter = Inter({ subsets: ["latin"] });

export const LoginContext = createContext<[boolean, Function]>([
  false,
  () => {},
]);

export default function Layout({ children }: LayoutProps) {
  const [isLogin, setIsLogin] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLogin(true);
    }
  }, [isLogin]);

  return (
    <LoginContext.Provider value={[isLogin, setIsLogin]}>
      <Head>
        <title>cyclip.com</title>
        <meta
          name="description"
          content="Простой фронтенд для сайта коротких видео coub.com"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.container} ${inter.className}`} ref={ref}>
        <Navbar scrollRef={ref} />
        <main className={styles.main}>{children}</main>
      </div>
    </LoginContext.Provider>
  );
}

interface LayoutProps {
  children: ReactElement;
}
