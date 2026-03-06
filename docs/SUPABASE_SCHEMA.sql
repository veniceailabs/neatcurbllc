-- Neat Curb Admin Dashboard - Supabase Schema Setup
-- Run these SQL statements in your Supabase dashboard to set up the required tables

-- 1. INVOICES TABLE
-- Stores invoice records imported from Yardbook
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue'
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);

-- 2. PAYMENTS TABLE
-- Stores payment records imported from Yardbook
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash', 'check', 'card', 'bank_transfer', 'other'
  category TEXT NOT NULL DEFAULT 'income', -- 'income', 'expense', 'refund'
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_category ON payments(category);

-- 3. EXPENSES TABLE
-- Stores business expense records imported from Yardbook
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10, 2) NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other', -- 'fuel', 'equipment', 'supplies', 'labor', 'utilities', 'other'
  paid_to TEXT NOT NULL, -- vendor/payee name
  payment_method TEXT NOT NULL DEFAULT 'cash', -- 'cash', 'check', 'card', 'bank_transfer', 'other'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC);

-- 4. ENHANCE CLIENTS TABLE (if not already present)
-- Add fields for better Yardbook integration
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_first_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_last_name TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- 5. PRODUCTS/SERVICES TABLE (for catalog system)
-- Already exists in business-os, but documented here for reference
-- CREATE TABLE IF NOT EXISTS products (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   description TEXT,
--   unit_price DECIMAL(10, 2),
--   category TEXT,
--   active BOOLEAN DEFAULT true,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );

-- EXAMPLE QUERIES FOR TESTING

-- View total expenses by category
-- SELECT category, SUM(amount) as total FROM expenses GROUP BY category;

-- View unpaid invoices
-- SELECT * FROM invoices WHERE status = 'draft' OR status = 'sent' ORDER BY due_date;

-- View recent payments
-- SELECT * FROM payments ORDER BY payment_date DESC LIMIT 10;

-- View total income vs expenses for current month
-- SELECT
--   (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE category = 'income' AND payment_date >= date_trunc('month', now())) as monthly_income,
--   (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', now())) as monthly_expenses;
