import type { ReactNode } from "react";

export default function SectionHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <div className="section-title">{title}</div>
        {subtitle ? <div className="section-sub">{subtitle}</div> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
