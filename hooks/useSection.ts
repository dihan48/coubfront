import { createContext, useContext } from "react";
import { SiteSection } from "@/helpers/core";

const SectionContext = createContext<SiteSection>("self");

export const SectionProvider = SectionContext.Provider;

export function useSection() {
  return useContext(SectionContext);
}
