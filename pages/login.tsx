import { useRouter } from "next/router";
import { ReactElement, useRef } from "react";
import type { NextPageWithLayout } from "./_app";
import Layout from "@/components/layouts/main";
import useIsLogin from "@/hooks/useIsLogin";

import styles from "../styles/login.module.css";

const Page: NextPageWithLayout = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isLogin, setIsLogin] = useIsLogin();

  return (
    <div className={styles.container}>
      <form
        className={styles.form}
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.target as HTMLFormElement);
          const login = formData.get("login");
          const password = formData.get("password");

          fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              login,
              password,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                alert(data.error);
              } else {
                setIsLogin(true);
                router.push("/");
              }
            });
        }}
      >
        <input
          type="text"
          name="login"
          placeholder="Логин"
          autoComplete="off"
          className={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          autoComplete="off"
          className={styles.input}
        />
        <div className={styles.buttons}>
          <button type="submit" className={styles.login_button}>
            Войти
          </button>
          <button
            type="button"
            className={styles.login_button}
            onClick={() => {
              const formData = new FormData(formRef.current as HTMLFormElement);
              const login = formData.get("login");
              const password = formData.get("password");

              fetch("/api/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  login,
                  password,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.error) {
                    alert(data.error);
                  } else {
                    setIsLogin(true);
                    router.push("/");
                  }
                });
            }}
          >
            Регистрация
          </button>
        </div>
      </form>
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Page;
