import type { NextPageWithLayout } from "./_app";
import { ReactElement, useRef } from "react";
import Layout from "@/components/layouts/main";

const Page: NextPageWithLayout = () => {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
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
              window.location.href = "/";
              localStorage.setItem("token", data.token);
            }
          });
      }}
    >
      <input type="text" name="login" />
      <input type="password" name="password" />
      <button type="submit">Войти</button>
      <button
        type="button"
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
                window.location.href = "/";
                localStorage.setItem("token", data.token);
              }
            });
        }}
      >
        Регистрация
      </button>
    </form>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Page;
