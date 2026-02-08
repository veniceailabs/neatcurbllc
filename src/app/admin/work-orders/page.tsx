"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type Job = {
  id: string;
  service: string | null;
  status: string | null;
  scheduled_date: string | null;
  proof_photo_url: string | null;
};

export default function WorkOrdersPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id,service,status,scheduled_date,proof_photo_url")
      .order("scheduled_date", { ascending: true });
    if (data) setJobs(data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (jobId: string, status: string) => {
    setBusyId(jobId);
    await supabase.from("jobs").update({ status }).eq("id", jobId);
    await load();
    setBusyId(null);
  };

  const uploadProof = async (jobId: string, file: File) => {
    setBusyId(jobId);

    let geo: { lat: number; lng: number } | null = null;
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000
          });
        });
        geo = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch {
        geo = null;
      }
    }

    const extension = file.name.split(".").pop() || "jpg";
    const path = `job-${jobId}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage
      .from("proof-of-work")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage
        .from("proof-of-work")
        .getPublicUrl(path);

      await supabase
        .from("jobs")
        .update({
          proof_photo_url: urlData.publicUrl,
          proof_uploaded_at: new Date().toISOString(),
          proof_geo: geo
        })
        .eq("id", jobId);

      await supabase
        .from("audit_logs")
        .insert({
          action: "proof_of_work_uploaded",
          entity: "job",
          entity_id: jobId,
          metadata: { url: urlData.publicUrl, geo }
        });
    }

    await load();
    setBusyId(null);
  };

  return (
    <div className="panel">
      <SectionHeader
        title={copy.admin.workOrders.title}
        subtitle={copy.admin.workOrders.subtitle}
      />
      <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        {jobs.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>{copy.admin.workOrders.emptyTitle}</div>
            <div className="note">{copy.admin.workOrders.emptyBody}</div>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="kpi-card">
              <div style={{ fontWeight: 700 }}>{job.service || "Job"}</div>
              <div className="note">
                {copy.admin.workOrders.date}:{" "}
                {job.scheduled_date || copy.admin.workOrders.unscheduled}
              </div>
              <div className="note">
                {copy.admin.workOrders.status}: {job.status || "queued"}
              </div>
              {job.proof_photo_url ? (
                <a
                  className="note"
                  href={job.proof_photo_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.admin.workOrders.viewProof}
                </a>
              ) : null}
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <button
                  className="button-primary"
                  type="button"
                  disabled={busyId === job.id}
                  onClick={() => updateStatus(job.id, "in_progress")}
                >
                  {copy.admin.workOrders.start}
                </button>
                <button
                  className="button-primary"
                  type="button"
                  disabled={busyId === job.id}
                  onClick={() => updateStatus(job.id, "complete")}
                >
                  {copy.admin.workOrders.finish}
                </button>
                <label className="button-secondary" style={{ cursor: "pointer" }}>
                  {copy.admin.workOrders.upload}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadProof(job.id, file);
                    }}
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
