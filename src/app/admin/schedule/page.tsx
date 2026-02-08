"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";

type Job = {
  id: string;
  scheduled_at: string;
  route_name: string;
  crew: string;
  status: string;
};

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id,scheduled_at,route_name,crew,status")
        .order("scheduled_at", { ascending: true });
      if (data) setJobs(data);
    };
    load();
  }, []);

  return (
    <div className="panel">
      <SectionHeader
        title="Schedule"
        subtitle="Crew scheduling for live and upcoming jobs."
        action={<span className="pill">{jobs.length} scheduled</span>}
      />
      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {jobs.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No scheduled jobs</div>
            <div className="note">Add routes and jobs to populate the calendar.</div>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>
                {new Date(job.scheduled_at).toLocaleString()}
              </div>
              <div className="note">Route: {job.route_name}</div>
              <div className="note">Crew: {job.crew}</div>
              <div className="note">Status: {job.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
