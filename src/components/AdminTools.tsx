"use client";

import BusinessAIChat from "@/components/BusinessAIChat";
import { useAdminRole } from "@/components/admin-context";

export default function AdminTools() {
  const { role } = useAdminRole();

  if (role !== "admin") return null;

  return <BusinessAIChat />;
}
