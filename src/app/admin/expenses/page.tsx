"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import CSVImportDialog from "@/components/CSVImportDialog";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import { mapYardbookExpensesToExpenses, batchInsert } from "@/lib/csvImport";

type Expense = {
  id: string;
  amount: number;
  expense_date: string;
  category: string;
  paid_to: string;
  payment_method: string;
  notes: string;
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

export default function ExpensesPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("expenses")
      .select("id,amount,expense_date,category,paid_to,payment_method,notes")
      .order("expense_date", { ascending: false });
    if (data) setExpenses(data as Expense[]);
  };

  useEffect(() => {
    load();
  }, []);

  const handleImportCSV = async (data: { headers: string[]; rows: Record<string, string>[] }) => {
    try {
      const mappedExpenses = mapYardbookExpensesToExpenses(data.rows);
      const result = await batchInsert(supabase, "expenses", mappedExpenses);

      setImportSuccess(`Successfully imported ${result.successful} expenses. ${result.failed > 0 ? `${result.failed} failed.` : ""}`);
      await load();

      if (result.failed > 0) {
        setImportError(`${result.failed} records failed to import`);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to import expenses");
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((expense) => {
    const cat = expense.category || "Other";
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (expense.amount || 0);
  });

  return (
    <div className="panel">
      <SectionHeader
        title="Expenses"
        subtitle="Track and manage all business expenses."
        action={<span className="pill">{moneyFormatter.format(totalExpenses)} total</span>}
      />

      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <button
          onClick={() => setIsImportOpen(true)}
          className="button-primary"
        >
          Import from Yardbook
        </button>
      </div>

      {importSuccess && (
        <div style={{
          marginTop: "12px",
          backgroundColor: "#efe",
          color: "#3c3",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {importSuccess}
        </div>
      )}

      {importError && (
        <div style={{
          marginTop: "12px",
          backgroundColor: "#fee",
          color: "#c33",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {importError}
        </div>
      )}

      {expenses.length > 0 && (
        <div style={{
          marginTop: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px"
        }}>
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <div key={category} className="kpi-card">
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>{category}</div>
              <div style={{ fontSize: "18px", fontWeight: 600, color: "#0a7ea4" }}>
                {moneyFormatter.format(amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
        {expenses.length === 0 ? (
          <div className="kpi-card">
            <div style={{ fontWeight: 700 }}>No expenses recorded</div>
            <div className="note">Import from Yardbook or add expenses manually.</div>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="kpi-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{expense.paid_to || "Unknown vendor"}</div>
                  <div className="note">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </div>
                  <div className="note" style={{ marginTop: "4px" }}>
                    {expense.category || "General"} · {expense.payment_method || "Unknown"}
                  </div>
                  {expense.notes && (
                    <div className="note" style={{ marginTop: "4px", fontStyle: "italic" }}>
                      {expense.notes}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600, textAlign: "right" }}>
                  {moneyFormatter.format(expense.amount || 0)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CSVImportDialog
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false);
          setImportSuccess(null);
          setImportError(null);
        }}
        onImport={handleImportCSV}
        title="Import Expenses from Yardbook"
        description="Upload your Yardbook expenses CSV export to import all expense records."
      />
    </div>
  );
}
