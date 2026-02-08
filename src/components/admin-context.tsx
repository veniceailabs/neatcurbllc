"use client";

import { createContext, useContext } from "react";

export type AdminRole = "admin" | "staff" | "user";

type AdminContextValue = {
  role: AdminRole | null;
};

const AdminContext = createContext<AdminContextValue>({ role: null });

export function AdminProvider({
  role,
  children
}: {
  role: AdminRole | null;
  children: React.ReactNode;
}) {
  return (
    <AdminContext.Provider value={{ role }}>{children}</AdminContext.Provider>
  );
}

export function useAdminRole() {
  return useContext(AdminContext);
}
