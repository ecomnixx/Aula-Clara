"use client";

import { createContext, useContext } from "react";

type AccessContextValue = {
  isMaster: boolean;
  openAccessManager: () => void;
  openAccount: () => void;
  openInstall: () => void;
  userEmail: string;
  userName: string;
  pendingRegistrations: number;
};

export const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccessControl() {
  const context = useContext(AccessContext);
  return context ?? { isMaster: false, openAccessManager: () => undefined, openAccount: () => undefined, openInstall: () => undefined, userEmail: "", userName: "Professor(a)", pendingRegistrations: 0 };
}
