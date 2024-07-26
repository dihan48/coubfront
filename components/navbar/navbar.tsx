import Link from "next/link";
import { useRouter } from "next/router";
import { RefObject } from "react";
import Cookies from "js-cookie";
import useIsLogin from "@/hooks/useIsLogin";

import styles from "./navbar.module.css";

export function Navbar({
  scrollRef,
}: {
  scrollRef: RefObject<HTMLDivElement>;
}) {
  const [isLogin, setIsLogin] = useIsLogin();
  const router = useRouter();

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <NavLink href="/" label="SELF" scrollRef={scrollRef} />
        <NavLink href="/daily" label="Горячее" scrollRef={scrollRef} />
        <NavLink href="/rising" label="В тренде" scrollRef={scrollRef} />
        <NavLink href="/fresh" label="Свежее" scrollRef={scrollRef} />
      </nav>
      {router.pathname !== "/login" && router.pathname !== "/register" && (
        <div>
          {isLogin ? (
            <button
              onClick={() => {
                Cookies.remove("token");
                setIsLogin(false);
              }}
              className={styles.logout_button}
            >
              Выйти
            </button>
          ) : (
            <Link href="/login" className={styles.login_button}>
              Войти
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function NavLink({ href, label, scrollRef }: NavLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={[
        styles.link,
        router.pathname === href ? styles.link_active : null,
      ].join(" ")}
      onClick={() => {
        if (scrollRef.current) {
          scrollRef.current.style.scrollBehavior = "auto";
          scrollRef.current.scrollTop = 0;
          scrollRef.current.style.scrollBehavior = "";
        }
      }}
    >
      {label}
    </Link>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  scrollRef: RefObject<HTMLDivElement>;
}
