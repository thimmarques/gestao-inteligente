import { Report } from "../types.ts";

interface SaveReportParams {
  type: Report["type"];
  periodStart: Date;
  periodEnd: Date;
  format: Report["format"];
  fileName: string;
}

export function saveReportToHistory(params: SaveReportParams): Report {
  const raw = localStorage.getItem("legaltech_reports");
  const reports: Report[] = raw ? JSON.parse(raw) : [];

  const newReport: Report = {
    id: crypto.randomUUID(),
    lawyer_id: "lawyer-1",
    type: params.type,
    period_start: params.periodStart.toISOString(),
    period_end: params.periodEnd.toISOString(),
    format: params.format,
    file_url: params.fileName,
    file_size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`, // Mock size
    created_at: new Date().toISOString(),
  };

  const updated = [newReport, ...reports].slice(0, 50);
  localStorage.setItem("legaltech_reports", JSON.stringify(updated));

  return newReport;
}
