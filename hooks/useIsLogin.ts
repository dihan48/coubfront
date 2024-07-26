import { LoginContext } from "@/components/layouts/main";
import { useContext } from "react";

export default function useIsLogin() {
  return useContext(LoginContext);
}
