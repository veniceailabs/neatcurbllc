#!/usr/bin/env node

/**
 * Automated Yardbook CSV Import for Neat Curb
 * Run: node scripts/import-yardbook-data.mjs <customers.csv> <invoices.csv> <payments.csv> <expenses.csv>
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const SUPABASE_URL = "https://aqsibikdsiyzmsosfgssdj.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("\n❌ Error: SUPABASE_SERVICE_ROLE_KEY not set");
  console.error("   Add it to .env.local\n");
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`\n📋 Usage: node scripts/import-yardbook-data.mjs <customers.csv> [invoices.csv] [payments.csv] [expenses.csv]\n`);
  console.log(`Example:\n  node scripts/import-yardbook-data.mjs ~/customers.csv ~/invoices.csv ~/payments.csv ~/expenses.csv\n`);
  process.exit(1);
}

const csvFiles = {
  customers: args[0],
  invoices: args[1],
  payments: args[2],
  expenses: args[3]
};

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

console.log(`\n🚀 Neat Curb - Yardbook Data Import\n`);
console.log(`📍 Supabase: ${SUPABASE_URL}`);
console.log(`📁 Files:\n`);

Object.entries(csvFiles).forEach(([type, file]) => {
  if (file) {
    const exists = fs.existsSync(file);
    console.log(`   ${type.padEnd(12)} ${exists ? "✅" : "❌"} ${file}`);
  }
});

// CSV Parser (from lib)
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) throw new Error("Empty CSV file");

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });

  return { headers, rows };
}

function parseCSVLine(line) {
  const result = [];
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
function mapCustomers(rows) {
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

function mapInvoices(rows) {
  return rows
    .filter((row) => row.id?.trim())
    .map((row) => ({
      invoice_number: row.invoice_number?.trim() || `INV-${row.id}`,
      client_id: null,
      amount: parseFloat(row.total || "0") || 0,
      status: (row.status || "draft").toLowerCase(),
      invoice_date: row.invoice_date?.trim() || new Date().toISOString(),
      due_date: row.due_date?.trim() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: row.comment?.trim() || row.message?.trim() || ""
    }));
}

function mapPayments(rows) {
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

function mapExpenses(rows) {
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

// Batch insert
async function batchInsert(table, records, batchSize = 100) {
  let successful = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);

    if (error) {
      failed += batch.length;
      errors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
    } else {
      successful += batch.length;
    }
  }

  return { successful, failed, errors };
}

// Main import
async function importData() {
  console.log(`\n📥 Importing data...\n`);

  try {
    // Import customers
    if (csvFiles.customers && fs.existsSync(csvFiles.customers)) {
      console.log(`[1/4] Importing customers...`);
      const customerCSV = fs.readFileSync(csvFiles.customers, "utf-8");
      const { rows } = parseCSV(customerCSV);
      const mappedCustomers = mapCustomers(rows);

      // Deduplicate by email
      const seen = new Set();
      const uniqueCustomers = mappedCustomers.filter((c) => {
        if (c.email && seen.has(c.email)) return false;
        if (c.email) seen.add(c.email);
        return true;
      });

      const result = await batchInsert("clients", uniqueCustomers);
      console.log(`      ✅ Imported ${result.successful} customers${result.failed > 0 ? ` (${result.failed} failed)` : ""}`);
    }

    // Import invoices
    if (csvFiles.invoices && fs.existsSync(csvFiles.invoices)) {
      console.log(`[2/4] Importing invoices...`);
      const invoiceCSV = fs.readFileSync(csvFiles.invoices, "utf-8");
      const { rows } = parseCSV(invoiceCSV);
      const mappedInvoices = mapInvoices(rows);
      const result = await batchInsert("invoices", mappedInvoices);
      console.log(`      ✅ Imported ${result.successful} invoices${result.failed > 0 ? ` (${result.failed} failed)` : ""}`);
    }

    // Import payments
    if (csvFiles.payments && fs.existsSync(csvFiles.payments)) {
      console.log(`[3/4] Importing payments...`);
      const paymentCSV = fs.readFileSync(csvFiles.payments, "utf-8");
      const { rows } = parseCSV(paymentCSV);
      const mappedPayments = mapPayments(rows);
      const result = await batchInsert("payments", mappedPayments);
      console.log(`      ✅ Imported ${result.successful} payments${result.failed > 0 ? ` (${result.failed} failed)` : ""}`);
    }

    // Import expenses
    if (csvFiles.expenses && fs.existsSync(csvFiles.expenses)) {
      console.log(`[4/4] Importing expenses...`);
      const expenseCSV = fs.readFileSync(csvFiles.expenses, "utf-8");
      const { rows } = parseCSV(expenseCSV);
      const mappedExpenses = mapExpenses(rows);
      const result = await batchInsert("expenses", mappedExpenses);
      console.log(`      ✅ Imported ${result.successful} expenses${result.failed > 0 ? ` (${result.failed} failed)` : ""}`);
    }

    console.log(`\n✅ Import complete!\n`);
    console.log(`📊 Corey's data is now in Neat Curb. He can log in and see:\n`);
    console.log(`   • Customers in /admin/clients`);
    console.log(`   • Expenses in /admin/expenses`);
    console.log(`   • Invoices and payments in the database\n`);

  } catch (error) {
    console.error(`\n❌ Import failed: ${error.message}\n`);
    process.exit(1);
  }
}

importData();
