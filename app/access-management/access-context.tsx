"use client";

import { createContext, useContext } from "react";

type AccessContextValue = {
  isMaster: boolean;
  openAccessManager: () => void;
  openAccount: () => void;
  userEmail: string;
  userName: string;
};

export const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccessControl() {
  const context = useContext(AccessContext);
  return context ?? { isMaster: false, openAccessManager: () => undefined, openAccount: () => undefined, userEmail: "", userName: "Professor(a)" };
}
