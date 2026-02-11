"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

type WorkItem = {
  work_item_id: string;
  source: "job" | "lead";
  name: string | null;
  phone: string | null;
  address: string | null;
  status: string | null;
};

export default function WorkOrdersPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("staff_work_view")
      .select("work_item_id,source,name,phone,address,status")
      .order("status", { ascending: true });
    if (data) setItems(data as WorkItem[]);
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
        {items.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>{copy.admin.workOrders.emptyTitle}</div>
            <div className="note">{copy.admin.workOrders.emptyBody}</div>
          </div>
        ) : (
          items.map((item) => (
            <div key={`${item.source}-${item.work_item_id}`} className="kpi-card">
              <div style={{ fontWeight: 700 }}>
                {item.source === "job" ? "Work Order" : "Lead Intake"}
              </div>
              <div className="note">Name: {item.name || "Unknown"}</div>
              <div className="note">Phone: {item.phone || "Unknown"}</div>
              <div className="note">
                Address: {item.address || "Unknown"}
              </div>
              <div className="note">
                {copy.admin.workOrders.status}: {item.status || "queued"}
              </div>
              {item.source === "job" ? (
                <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                  <button
                    className="button-primary"
                    type="button"
                    disabled={busyId === item.work_item_id}
                    onClick={() => updateStatus(item.work_item_id, "in_progress")}
                  >
                    {copy.admin.workOrders.start}
                  </button>
                  <button
                    className="button-primary"
                    type="button"
                    disabled={busyId === item.work_item_id}
                    onClick={() => updateStatus(item.work_item_id, "complete")}
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
                        if (file) uploadProof(item.work_item_id, file);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className="note" style={{ marginTop: "12px" }}>
                  Lead is visible for dispatch context only.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
