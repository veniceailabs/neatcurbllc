#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = "https://aqsibikdsiyzmsosfgssdj.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("\n❌ Error: SUPABASE_SERVICE_ROLE_KEY not set\n");
  process.exit(1);
}

const args = process.argv.slice(2);
const csvFiles = {
  customers: args[0],
  invoices: args[1],
  payments: args[2],
  expenses: args[3]
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

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

// Better data mappers
function mapCustomers(rows) {
  return rows
    .map((row) => ({
      id: row.id || undefined,
      name: row.business_name?.trim() || `${row.contact_first_name || ""} ${row.contact_last_name || ""}`.trim() || "Unknown",
      email: row.email?.trim() || null,
      address: `${row.address_line1 || ""} ${row.address_line2 || ""}`.trim() || null,
      type: "customer",
      phone: row.phone?.trim() || row.mobile?.trim() || null,
      contact_first_name: row.contact_first_name?.trim() || null,
      contact_last_name: row.contact_last_name?.trim() || null
    }))
    .filter(c => c.name && c.name !== "Unknown"); // Only keep records with names
}

function mapInvoices(rows) {
  return rows
    .filter((row) => row.id?.trim() && row.total?.trim())
    .map((row) => ({
      invoice_number: row.invoice_number?.trim() || `INV-${row.id}`,
      amount: parseFloat(row.total || "0") || 0,
      status: (row.status || "draft").toLowerCase(),
      invoice_date: row.invoice_date?.trim() || new Date().toISOString(),
      due_date: row.due_date?.trim() || null,
      notes: row.comment?.trim() || row.message?.trim() || null
    }))
    .filter(inv => inv.amount > 0); // Only valid invoices
}

function mapPayments(rows) {
  return rows
    .filter((row) => row.amount?.trim() && parseFloat(row.amount) > 0)
    .map((row) => ({
      amount: parseFloat(row.amount),
      payment_date: row.date_paid?.trim() || row.payment_date?.trim() || new Date().toISOString(),
      payment_method: row.payment_method?.trim() || "other",
      category: row.category?.trim() || "income",
      notes: row.note?.trim() || null
    }));
}

function mapExpenses(rows) {
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

async function batchInsert(table, records, batchSize = 50) {
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);

    if (error) {
      console.log(`      ⚠️  Batch ${Math.floor(i/batchSize)+1} error: ${error.message}`);
      failed += batch.length;
    } else {
      successful += batch.length;
    }
  }

  return { successful, failed };
}

async function importData() {
  console.log(`\n🚀 Neat Curb - Yardbook Data Import\n`);

  try {
    // Import customers
    if (csvFiles.customers && fs.existsSync(csvFiles.customers)) {
      console.log(`[1/4] Customers...`);
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

      console.log(`      Found ${mappedCustomers.length} records, ${uniqueCustomers.length} unique`);
      const result = await batchInsert("clients", uniqueCustomers);
      console.log(`      ✅ ${result.successful} imported${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
    }

    // Import invoices
    if (csvFiles.invoices && fs.existsSync(csvFiles.invoices)) {
      console.log(`[2/4] Invoices...`);
      const invoiceCSV = fs.readFileSync(csvFiles.invoices, "utf-8");
      const { rows } = parseCSV(invoiceCSV);
      const mappedInvoices = mapInvoices(rows);
      console.log(`      Found ${mappedInvoices.length} valid invoices`);
      const result = await batchInsert("invoices", mappedInvoices);
      console.log(`      ✅ ${result.successful} imported${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
    }

    // Import payments
    if (csvFiles.payments && fs.existsSync(csvFiles.payments)) {
      console.log(`[3/4] Payments...`);
      const paymentCSV = fs.readFileSync(csvFiles.payments, "utf-8");
      const { rows } = parseCSV(paymentCSV);
      const mappedPayments = mapPayments(rows);
      console.log(`      Found ${mappedPayments.length} valid payments`);
      const result = await batchInsert("payments", mappedPayments);
      console.log(`      ✅ ${result.successful} imported${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
    }

    // Import expenses
    if (csvFiles.expenses && fs.existsSync(csvFiles.expenses)) {
      console.log(`[4/4] Expenses...`);
      const expenseCSV = fs.readFileSync(csvFiles.expenses, "utf-8");
      const { rows } = parseCSV(expenseCSV);
      const mappedExpenses = mapExpenses(rows);
      console.log(`      Found ${mappedExpenses.length} valid expenses`);
      const result = await batchInsert("expenses", mappedExpenses);
      console.log(`      ✅ ${result.successful} imported${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
    }

    console.log(`\n✅ All imports complete!\n`);
    console.log(`📊 Corey can now log in and see:\n`);
    console.log(`   • Customers: https://neatcurbllc.com/admin/clients`);
    console.log(`   • Expenses: https://neatcurbllc.com/admin/expenses`);
    console.log(`   • Everything is ready to use!\n`);

  } catch (error) {
    console.error(`\n❌ Import error: ${error.message}\n`);
    process.exit(1);
  }
}

importData();
