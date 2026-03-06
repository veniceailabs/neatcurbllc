import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Parse CSV file content into an array of objects
 */
export function parseCSV(csvText: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) throw new Error("Empty CSV file");

  // Parse header line - handle quoted fields and commas within quotes
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());
  return result;
}

/**
 * Map Yardbook customer CSV to clients table format
 */
export function mapYardbookCustomersToClients(
  rows: Record<string, string>[]
): Array<{
  name: string;
  email: string;
  address: string;
  type: string;
  phone: string;
  contact_first_name: string;
  contact_last_name: string;
}> {
  return rows
    .filter((row) => row.business_name?.trim() || row.contact_first_name?.trim())
    .map((row) => ({
      name: row.business_name?.trim() || `${row.contact_first_name} ${row.contact_last_name}`.trim() || "Unknown",
      email: row.email?.trim() || "",
      address: `${row.address_line1 || ""} ${row.address_line2 || ""}`.trim(),
      type: "customer",
      phone: row.phone?.trim() || row.mobile?.trim() || "",
      contact_first_name: row.contact_first_name?.trim() || "",
      contact_last_name: row.contact_last_name?.trim() || ""
    }));
}

/**
 * Map Yardbook invoices CSV to invoices table format
 */
export function mapYardbookInvoicesToInvoices(
  rows: Record<string, string>[]
): Array<{
  invoice_number: string;
  client_id: string | null;
  amount: number;
  status: string;
  invoice_date: string;
  due_date: string;
  notes: string;
}> {
  return rows
    .filter((row) => row.id?.trim())
    .map((row) => ({
      invoice_number: row.invoice_number?.trim() || `INV-${row.id}`,
      client_id: null, // Will be matched by email or name
      amount: parseFloat(row.total || "0") || 0,
      status: (row.status || "draft").toLowerCase(),
      invoice_date: row.invoice_date?.trim() || new Date().toISOString(),
      due_date: row.due_date?.trim() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: row.comment?.trim() || row.message?.trim() || ""
    }));
}

/**
 * Map Yardbook payments CSV to payments table format
 */
export function mapYardbookPaymentsToPayments(
  rows: Record<string, string>[]
): Array<{
  amount: number;
  payment_date: string;
  payment_method: string;
  category: string;
  notes: string;
}> {
  return rows
    .filter((row) => row.id?.trim() && row.amount?.trim())
    .map((row) => ({
      amount: parseFloat(row.amount || "0") || 0,
      payment_date: row.date_paid?.trim() || row.payment_date?.trim() || new Date().toISOString(),
      payment_method: row.payment_method?.trim() || "other",
      category: row.category?.trim() || "income",
      notes: row.note?.trim() || row.notes?.trim() || ""
    }));
}

/**
 * Map Yardbook expenses CSV to expenses table format
 */
export function mapYardbookExpensesToExpenses(
  rows: Record<string, string>[]
): Array<{
  amount: number;
  expense_date: string;
  category: string;
  paid_to: string;
  payment_method: string;
  notes: string;
}> {
  return rows
    .filter((row) => row.id?.trim() && row.amount?.trim())
    .map((row) => ({
      amount: parseFloat(row.amount || "0") || 0,
      expense_date: row.expense_date?.trim() || new Date().toISOString(),
      category: row.category?.trim() || "other",
      paid_to: row.paid_to?.trim() || "",
      payment_method: row.payment_method?.trim() || "cash",
      notes: row.note?.trim() || ""
    }));
}

/**
 * Batch insert records into Supabase with error handling
 */
export async function batchInsert<T>(
  supabase: SupabaseClient,
  table: string,
  records: T[],
  batchSize = 100
): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ record: T; error: string }>;
}> {
  let successful = 0;
  let failed = 0;
  const errors: Array<{ record: T; error: string }> = [];

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);

    if (error) {
      failed += batch.length;
      batch.forEach((record) => {
        errors.push({ record, error: error.message });
      });
    } else {
      successful += batch.length;
    }
  }

  return { successful, failed, errors };
}
