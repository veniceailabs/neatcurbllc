"use client";

import { FormEvent, useRef, useState } from "react";
import { parseCSV } from "@/lib/csvImport";

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { headers: string[]; rows: Record<string, string>[] }) => Promise<void>;
  title: string;
  description: string;
}

export default function CSVImportDialog({
  isOpen,
  onClose,
  onImport,
  title,
  description
}: CSVImportDialogProps) {
  const [step, setStep] = useState<"upload" | "preview" | "importing">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCSVData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleParse = async () => {
    if (!file) return;

    try {
      const content = await file.text();
      const data = parseCSV(content);

      if (data.rows.length === 0) {
        setError("CSV file has no data rows");
        return;
      }

      setCSVData(data);
      setStep("preview");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
  };

  const handleImport = async (event: FormEvent) => {
    event.preventDefault();
    if (!csvData) return;

    setStep("importing");
    setImportStatus("Importing data...");

    try {
      await onImport(csvData);
      setImportStatus("Import complete!");
      setTimeout(() => {
        setStep("upload");
        setFile(null);
        setCSVData(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStep("preview");
    }
  };

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setCSVData(null);
    setError(null);
    setImportStatus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "24px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)"
      }}>
        <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>
          {title}
        </div>
        <div style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          {description}
        </div>

        {step === "upload" && (
          <form onSubmit={(e) => { e.preventDefault(); handleParse(); }} style={{ display: "grid", gap: "16px" }}>
            <label style={{
              border: "2px dashed #ddd",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: file ? "#f5f5f5" : "#fafafa",
              transition: "all 0.2s"
            }}>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                {file ? file.name : "Select CSV file"}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                Click to browse or drag and drop
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </label>

            {error && (
              <div style={{
                backgroundColor: "#fee",
                color: "#c33",
                padding: "12px",
                borderRadius: "4px",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={!file}
              >
                Parse CSV
              </button>
            </div>
          </form>
        )}

        {step === "preview" && csvData && (
          <form onSubmit={handleImport} style={{ display: "grid", gap: "16px" }}>
            <div style={{
              backgroundColor: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              fontSize: "14px"
            }}>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                Preview: {csvData.rows.length} rows, {csvData.headers.length} columns
              </div>
              <div style={{ color: "#666" }}>
                Columns: {csvData.headers.join(", ")}
              </div>
            </div>

            <div style={{
              overflowX: "auto",
              backgroundColor: "#fafafa",
              borderRadius: "4px",
              border: "1px solid #e0e0e0"
            }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    {csvData.headers.map((header) => (
                      <th key={header} style={{
                        padding: "8px",
                        textAlign: "left",
                        borderRight: "1px solid #e0e0e0",
                        fontWeight: 600,
                        whiteSpace: "nowrap"
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.rows.slice(0, 3).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      {csvData.headers.map((header) => (
                        <td key={header} style={{
                          padding: "8px",
                          borderRight: "1px solid #e0e0e0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "150px"
                        }}>
                          {row[header] || "--"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {csvData.rows.length > 3 && (
              <div style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
                Showing 3 of {csvData.rows.length} rows
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: "#fee",
                color: "#c33",
                padding: "12px",
                borderRadius: "4px",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setStep("upload"); setCSVData(null); }}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                className="button-primary"
              >
                Import {csvData.rows.length} Records
              </button>
            </div>
          </form>
        )}

        {step === "importing" && (
          <div style={{
            textAlign: "center",
            padding: "24px",
            display: "grid",
            gap: "16px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e0e0e0",
              borderTop: "3px solid #0a7ea4",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }}>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
            <div style={{ fontWeight: 600 }}>{importStatus}</div>
          </div>
        )}
      </div>
    </div>
  );
}
