"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type Job = {
  id: string;
  service: string;
  status: string;
  price: number | null;
  scheduled_date: string | null;
};

export default function JobsPage() {
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
        title="Jobs"
        subtitle="Scheduling, tracking, and service delivery."
        action={<span className="pill">{jobs.length} jobs</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {jobs.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No jobs yet</div>
            <div className="note">Create jobs to track upcoming service.</div>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{job.service}</div>
              <div className="note">Status: {job.status}</div>
              <div className="note">
                Scheduled: {job.scheduled_date ?? "--"}
              </div>
              <div className="note">
                Price: {job.price ? `$${job.price}` : "--"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
