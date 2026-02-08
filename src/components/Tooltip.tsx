"use client";

import { useTooltips } from "@/components/tooltip-context";

export default function Tooltip({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { enabled } = useTooltips();
  return (
    <span
      className={`tooltip ${enabled ? "on" : "off"}`}
      data-tooltip={enabled ? label : undefined}
    >
      {children}
    </span>
  );
}
