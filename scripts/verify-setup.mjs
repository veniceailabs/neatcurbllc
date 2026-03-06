import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aqsibikdsiyzmsosfgssdj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxc2liaWtkc2l5em1zb2Znc2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUyMTgxOCwiZXhwIjoyMDg2MDk3ODE4fQ.rPGzZzqsQGmkthPoo0hHviQmQy1nLXpJrPve-JEMNdU",
  { auth: { persistSession: false } }
);

console.log("\n📊 Neat Curb Database Status\n");

// Check each table
const tables = ["clients", "invoices", "payments", "expenses", "products"];
let allReady = true;

for (const table of tables) {
  const { data, error } = await supabase.from(table).select().limit(1);
  
  if (error && error.code === "PGRST116") {
    console.log(`❌ ${table.padEnd(15)} - does not exist`);
    allReady = false;
  } else if (error) {
    console.log(`⚠️  ${table.padEnd(15)} - error: ${error.message}`);
    allReady = false;
  } else {
    console.log(`✅ ${table.padEnd(15)} - ready for imports`);
  }
}

console.log(`\n${allReady ? '🎉 All systems go!' : '⚠️  Some tables missing'}\n`);

process.exit(allReady ? 0 : 1);
