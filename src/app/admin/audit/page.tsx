"use client";

import { useEffect, useMemo, useState } from "react";
import { createAuditBundle, type AuditRecord } from "@/lib/audit";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type AuditRow = {
  id: string;
  occurred_at: string;
  actor: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
};

export default function AuditPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [records, setRecords] = useState<AuditRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("id,occurred_at,actor,action,metadata")
        .order("occurred_at", { ascending: false })
        .limit(50);

      if (data) {
        const mapped = (data as AuditRow[]).map((row) => ({
          id: row.id,
          timestamp: row.occurred_at,
          actor: row.actor ?? "system",
          action: row.action,
          meta: row.metadata
            ? (JSON.parse(JSON.stringify(row.metadata)) as Record<
                string,
                string | number | boolean | null
              >)
            : undefined
        }));
        setRecords(mapped);
      }
    };
    load();
  }, []);

  const audit = useMemo(() => createAuditBundle(records), [records]);

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.audit.title}
        subtitle={copy.admin.audit.subtitle}
        action={<span className="pill">{copy.admin.audit.badge}</span>}
      />
      <div style={{ marginTop: "16px" }}>
        {records.length === 0 ? (
          <div className="note">{copy.admin.audit.empty}</div>
        ) : (
          <>
            <div className="kpi-card" style={{ marginBottom: "16px" }}>
              <div className="kpi-label">{copy.admin.audit.currentRoot}</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                {audit.root}
              </div>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {records.map((record, index) => (
                <div key={record.id} className="kpi-card">
                  <div style={{ fontWeight: 700 }}>{record.action}</div>
                  <div className="note">
                    {copy.admin.audit.actor}: {record.actor}
                  </div>
                  <div className="note">
                    {copy.admin.audit.timestamp}: {record.timestamp}
                  </div>
                  <div className="note">
                    {copy.admin.audit.leaf}: {audit.leaves[index]}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
