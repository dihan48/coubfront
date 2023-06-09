import Link from "next/link";
import { useRouter } from "next/router";

import styles from "./navbar.module.css";
import { RefObject } from "react";

export function Navbar({
  scrollRef,
}: {
  scrollRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <NavLink href="/" label="SELF" scrollRef={scrollRef} />
        <NavLink href="/daily" label="Горячее" scrollRef={scrollRef} />
        <NavLink href="/rising" label="В тренде" scrollRef={scrollRef} />
        <NavLink href="/fresh" label="Свежее" scrollRef={scrollRef} />
      </nav>
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
        scrollRef.current?.scroll({ top: 0, left: 0, behavior: "auto" });
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
