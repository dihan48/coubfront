import Link from "next/link";
import { useRouter } from "next/router";

import styles from "./navbar.module.css";

export function Navbar() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <NavLink href="/daily" label="Горячее" />
        <NavLink href="/rising" label="В тренде" />
        <NavLink href="/" label="Свежее" />
      </nav>
    </div>
  );
}

function NavLink({ href, label }: NavLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={[
        styles.link,
        router.pathname === href ? styles.link_active : null,
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
}
