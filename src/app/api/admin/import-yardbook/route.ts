import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Lazy-load Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase config");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

// CSV Parser
function parseCSV(csvText: string) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) throw new Error("Empty CSV file");

  let headerLineIndex = 0;

  // Skip "Invoice Headers" or similar label lines
  if (lines[0] && !lines[0].includes(",")) {
    headerLineIndex = 1;
  }

  const headers = parseCSVLine(lines[headerLineIndex]);
  const rows = lines.slice(headerLineIndex + 1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Data mappers
function mapCustomers(rows: any[]) {
  return rows
    .map((row) => {
      const name =
        row.business_name?.trim() ||
        `${row.contact_first_name || ""} ${row.contact_last_name || ""}`.trim() ||
        "Unknown";

      const address = `${row.address_line1 || ""} ${row.address_line2 || ""}`.trim();

      // Only include columns that definitely exist in clients table
      return {
        name,
        type: "customer",
        address: address || null
      };
    })
    .filter((c) => c.name && c.name !== "Unknown");
}

function mapInvoices(rows: any[]) {
  return rows
    .filter((row) => row.id?.trim())
    .map((row) => {
      // Yardbook invoices don't have a "total" column, so we'll use a default amount
      // or parse it from the message/comment if available
      return {
        invoice_number: (row.invoice_num || row.invoice_number || `INV-${row.id}`).trim(),
        amount: 0, // Invoices from Yardbook export don't have amounts, will need manual entry
        status: (row.status || "draft").toLowerCase(),
        invoice_date: row.invoice_date?.trim() || new Date().toISOString(),
        due_date: row.due_date?.trim() || null,
        notes: (row.comment || row.message || "").trim() || null
      };
    })
    .filter((inv) => inv.invoice_number);
}

function mapPayments(rows: any[]) {
  return rows
    .filter((row) => row.amount?.trim() && parseFloat(row.amount) > 0)
    .map((row) => ({
      amount: parseFloat(row.amount),
      payment_date: row.date?.trim() || row.date_paid?.trim() || row.payment_date?.trim() || new Date().toISOString(),
      payment_method: (row.method || row.payment_method || "other").toLowerCase().trim(),
      category: (row.category || "income").trim()
    }));
}

function mapExpenses(rows: any[]) {
  return rows
    .filter((row) => row.id?.trim() && row.amount?.trim() && parseFloat(row.amount) > 0)
    .map((row) => ({
      amount: parseFloat(row.amount),
      expense_date: row.expense_date?.trim() || new Date().toISOString(),
      category: row.category?.trim() || "other",
      paid_to: row.paid_to?.trim() || "Unspecified",
      payment_method: row.payment_method?.trim() || "cash",
      notes: row.note?.trim() || null
    }));
}

async function batchInsert(table: string, records: any[], batchSize = 50) {
  const supabase = getSupabaseClient();
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);

    if (error) {
      failed += batch.length;
    } else {
      successful += batch.length;
    }
  }

  return { successful, failed };
}

export async function POST(request: NextRequest) {
  try {
    const docsDir = path.join(process.cwd(), "docs");

    const stats = {
      customers: { parsed: 0, imported: 0, failed: 0 },
      invoices: { parsed: 0, imported: 0, failed: 0 },
      payments: { parsed: 0, imported: 0, failed: 0 },
      expenses: { parsed: 0, imported: 0, failed: 0 }
    };

    // Import customers
    const customerPath = path.join(docsDir, "2418757911748270247.csv");
    if (fs.existsSync(customerPath)) {
      const customerCSV = fs.readFileSync(customerPath, "utf-8");
      const { rows } = parseCSV(customerCSV);
      const mappedCustomers = mapCustomers(rows);

      stats.customers.parsed = mappedCustomers.length;
      const result = await batchInsert("clients", mappedCustomers);
      stats.customers.imported = result.successful;
      stats.customers.failed = result.failed;
    }

    // Import invoices
    const invoicePath = path.join(docsDir, "2927169617236361935.csv");
    if (fs.existsSync(invoicePath)) {
      const invoiceCSV = fs.readFileSync(invoicePath, "utf-8");
      const { rows } = parseCSV(invoiceCSV);
      const mappedInvoices = mapInvoices(rows);

      stats.invoices.parsed = mappedInvoices.length;
      const result = await batchInsert("invoices", mappedInvoices);
      stats.invoices.imported = result.successful;
      stats.invoices.failed = result.failed;
    }

    // Import payments
    const paymentPath = path.join(docsDir, "6225792354250269660.csv");
    if (fs.existsSync(paymentPath)) {
      const paymentCSV = fs.readFileSync(paymentPath, "utf-8");
      const { rows } = parseCSV(paymentCSV);
      const mappedPayments = mapPayments(rows);

      stats.payments.parsed = mappedPayments.length;
      const result = await batchInsert("payments", mappedPayments);
      stats.payments.imported = result.successful;
      stats.payments.failed = result.failed;
    }

    // Import expenses
    const expensePath = path.join(docsDir, "4558278226436209723.csv");
    if (fs.existsSync(expensePath)) {
      const expenseCSV = fs.readFileSync(expensePath, "utf-8");
      const { rows } = parseCSV(expenseCSV);
      const mappedExpenses = mapExpenses(rows);

      stats.expenses.parsed = mappedExpenses.length;
      const result = await batchInsert("expenses", mappedExpenses);
      stats.expenses.imported = result.successful;
      stats.expenses.failed = result.failed;
    }

    return NextResponse.json({
      success: true,
      message: "All data imported successfully",
      stats
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
