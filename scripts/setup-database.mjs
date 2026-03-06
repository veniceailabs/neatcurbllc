#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const SUPABASE_URL = "https://aqsibikdsiyzmsosfgssdj.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("\n❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  console.error("   Set it from .env.local\n");
  process.exit(1);
}

console.log(`\n🚀 Neat Curb Database Setup\n`);
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Using Service Role Key\n`);

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Read SQL schema
const schemaPath = path.join(__dirname, "../docs/SUPABASE_SCHEMA.sql");
const sqlContent = fs.readFileSync(schemaPath, "utf-8");

// Extract CREATE TABLE statements
const createTableRegex = /CREATE TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)\s*\(/gi;
const matches = [...sqlContent.matchAll(createTableRegex)];
const expectedTables = matches.map(m => m[1].toLowerCase());

console.log(`📋 Expected tables to create:`);
expectedTables.forEach(t => console.log(`   - ${t}`));

// Function to check if table exists
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    // Table exists if no "relation does not exist" error
    return !error || error.code !== "PGRST116";
  } catch {
    return false;
  }
}

// Verify all tables exist
async function verifyTables() {
  console.log(`\n🔍 Checking for existing tables...\n`);

  const results = [];
  for (const table of expectedTables) {
    const exists = await tableExists(table);
    results.push({ table, exists });

    if (exists) {
      console.log(`   ✅ ${table} - exists`);
    } else {
      console.log(`   ⚠️  ${table} - missing`);
    }
  }

  return results;
}

// Main execution
(async () => {
  const tableStatus = await verifyTables();
  const allExist = tableStatus.every(r => r.exists);

  if (allExist) {
    console.log(`\n✅ All tables already exist! Database is ready.\n`);
    process.exit(0);
  }

  const missingTables = tableStatus.filter(r => !r.exists).map(r => r.table);

  console.log(`\n⚠️  Missing tables: ${missingTables.join(", ")}`);
  console.log(`\n📝 How to create the missing tables:\n`);
  console.log(`1. Open: https://app.supabase.co/project/aqsibikdsiyzmsosfgssdj/sql/new`);
  console.log(`2. Copy this SQL and paste it into the editor:`);
  console.log(`\n${'='.repeat(60)}`);

  // Output just the CREATE TABLE and INDEX statements
  const createStatements = sqlContent
    .split(';')
    .filter(stmt => {
      const s = stmt.trim();
      return (s.startsWith('CREATE TABLE') || s.startsWith('CREATE INDEX') ||
              s.startsWith('ALTER TABLE')) && s.length > 10;
    })
    .map(s => s.trim())
    .join(';\n\n') + ';';

  console.log(createStatements);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`3. Click "Run" to execute`);
  console.log(`4. All tables and indexes will be created automatically\n`);

  process.exit(1);
})();
