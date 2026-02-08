"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type Job = {
  id: string;
  service: string;
  status: string;
  price: number | null;
  scheduled_date: string | null;
};

export default function JobsPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id,service,status,price,scheduled_date")
        .order("created_at", { ascending: false });
      if (data) setJobs(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.jobs.title}
        subtitle={copy.admin.jobs.subtitle}
        action={<span className="pill">{jobs.length} {copy.admin.jobs.jobs}</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {jobs.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>{copy.admin.jobs.emptyTitle}</div>
            <div className="note">{copy.admin.jobs.emptyBody}</div>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{job.service}</div>
              <div className="note">
                {copy.admin.jobs.status}: {job.status}
              </div>
              <div className="note">
                {copy.admin.jobs.scheduled}: {job.scheduled_date ?? "--"}
              </div>
              <div className="note">
                {copy.admin.jobs.price}: {job.price ? `$${job.price}` : "--"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
