# Yardbook to Neat Curb: Data Import Guide

This guide walks you through importing all your data from Yardbook to the Neat Curb admin dashboard.

## Overview

The import system allows you to seamlessly migrate your Yardbook data to Neat Curb in four categories:

1. **Customers** - Client/customer contact information
2. **Invoices** - Invoice records and billing history
3. **Payments** - Payment records and financial transactions
4. **Expenses** - Business expense records

## Prerequisites

Before importing, make sure you have:

1. **Exported CSV files from Yardbook** - See "Exporting from Yardbook" section below
2. **Access to Neat Curb Admin Dashboard** - You need login credentials
3. **Database tables created** - The tables must exist in Supabase (see "Database Setup" section)

## Exporting from Yardbook

### Step 1: Access Yardbook Export

1. Log in to your Yardbook account
2. Go to **Settings** → **Data Export** (or similar)
3. You should see export options for different data types

### Step 2: Export Each Data Type

For each category below, export the CSV file:

#### Customers CSV
- File type: CSV
- Select: All customers/clients
- Include fields: Name, email, address, phone, contact name, etc.
- Recommended filename: `yardbook-customers-export.csv`

#### Invoices CSV
- File type: CSV
- Select: All invoices (or date range as needed)
- Include fields: Invoice number, amount, status, date, due date, client name, notes
- Recommended filename: `yardbook-invoices-export.csv`

#### Payments CSV
- File type: CSV
- Select: All payments
- Include fields: Amount, date, payment method, category, associated invoice
- Recommended filename: `yardbook-payments-export.csv`

#### Expenses CSV
- File type: CSV
- Select: All expenses
- Include fields: Amount, date, category, paid to, payment method, notes
- Recommended filename: `yardbook-expenses-export.csv`

## Importing into Neat Curb

### Step 1: Access Import Page

1. Log in to your Neat Curb admin dashboard
2. Click **Import Data** in the left sidebar
3. You'll see 4 import options: Customers, Invoices, Payments, Expenses

### Step 2: Import Customers

1. Click the **Import Customers** button
2. A dialog will appear asking you to select a CSV file
3. Click the file upload area and select your `yardbook-customers-export.csv` file
4. Click **Parse CSV** to preview the data
5. Review the preview to ensure the data looks correct
6. Click **Import [X] Records** to complete the import
7. You'll see a success message with the number of customers imported

**What happens:**
- Customer contacts are imported into the Clients section
- Duplicate emails are automatically detected and skipped
- You can view imported customers in `/admin/clients`

### Step 3: Import Invoices

1. Click the **Import Invoices** button
2. Select your `yardbook-invoices-export.csv` file
3. Click **Parse CSV** to preview
4. Click **Import [X] Records**

**What happens:**
- Invoices are imported with amounts, dates, and status
- Invoice numbers are preserved or generated if missing
- You can view imported invoices in `/admin/invoices`

### Step 4: Import Payments

1. Click the **Import Payments** button
2. Select your `yardbook-payments-export.csv` file
3. Click **Parse CSV** to preview
4. Click **Import [X] Records**

**What happens:**
- Payment records are imported with amounts and methods
- Payments are linked to invoices when possible
- You can view imported payments in a payments dashboard (if added)

### Step 5: Import Expenses

1. Click the **Import Expenses** button
2. Select your `yardbook-expenses-export.csv` file
3. Click **Parse CSV** to preview
4. Click **Import [X] Records**

**What happens:**
- Expense records are imported with amounts, categories, and vendors
- You can view imported expenses in `/admin/expenses`
- Expenses are categorized by type (fuel, equipment, supplies, etc.)

## What Gets Imported

### Customer Fields Mapped

| Yardbook Field | Neat Curb Field | Notes |
|---|---|---|
| Business Name | name | Uses business name if available, otherwise first + last name |
| Email | email | Unique identifier, duplicates are skipped |
| Address Line 1 + 2 | address | Combined into single address field |
| Phone | phone | Stored with contact info |
| Mobile | phone | Used if phone is empty |
| Contact First Name | contact_first_name | Preserved for future contact |
| Contact Last Name | contact_last_name | Preserved for future contact |

### Invoice Fields Mapped

| Yardbook Field | Neat Curb Field | Notes |
|---|---|---|
| Invoice Number | invoice_number | Unique identifier for tracking |
| Total | amount | Converted to numeric format |
| Status | status | draft, sent, paid, overdue |
| Invoice Date | invoice_date | Timestamp when invoice was created |
| Due Date | due_date | Payment due date |
| Comment/Message | notes | Preserved in notes field |

### Payment Fields Mapped

| Yardbook Field | Neat Curb Field | Notes |
|---|---|---|
| Amount | amount | Numeric amount paid |
| Date Paid | payment_date | When payment was received |
| Payment Method | payment_method | cash, check, card, bank_transfer, other |
| Category | category | income, expense, refund |

### Expense Fields Mapped

| Yardbook Field | Neat Curb Field | Notes |
|---|---|---|
| Amount | amount | Numeric expense amount |
| Expense Date | expense_date | When expense occurred |
| Category | category | fuel, equipment, supplies, labor, utilities, other |
| Paid To | paid_to | Vendor or payee name |
| Payment Method | payment_method | How the expense was paid |
| Note | notes | Additional details about the expense |

## Import History

After each import, you'll see a summary showing:
- **Successful** - Number of records imported successfully
- **Failed** - Number of records that failed (if any)
- **Timestamp** - When the import occurred

Failed records typically indicate:
- Missing required fields
- Duplicate entries
- Data format issues

## Troubleshooting

### "Failed to parse CSV"
- Make sure the file is actually a CSV (not Excel, PDF, etc.)
- Check that the file is properly formatted with headers in the first row

### "Import failed" or "Some records failed"
- Check the error message for specific issues
- Common causes: missing fields, invalid data format, duplicate entries
- You can retry importing after fixing the CSV file

### Duplicate customers not imported
- The system detects duplicates by email address
- If multiple records have the same email, only the first is imported
- Remove duplicates from the CSV before importing, or
- Import different subsets separately

### Missing data after import
- Check that the import succeeded (look for success message)
- Verify the data is in the correct Neat Curb section
  - Customers → `/admin/clients`
  - Invoices → `/admin/invoices`
  - Expenses → `/admin/expenses`

## Database Requirements

The following tables must exist in Supabase for imports to work:

- `clients` - Customer information
- `invoices` - Invoice records
- `payments` - Payment records
- `expenses` - Expense records

If you get "table doesn't exist" errors, run the SQL statements in `SUPABASE_SCHEMA.sql` to create the required tables.

## After Importing

### Next Steps

1. **Review the data** - Go to each section and verify the import looks correct
2. **Update any missing data** - Fill in any fields that weren't imported
3. **Set up client relationships** - Link invoices and payments to clients
4. **Configure services** - Set up your service catalog in **NeatCurbOS** → **Services & Prices**
5. **Test workflows** - Create a test quote, invoice, or expense to verify everything works

### Data Validation

After importing, you should:
- [ ] View at least 3 customers to verify data quality
- [ ] Check that invoice amounts are correct
- [ ] Verify payment records match your books
- [ ] Review expense categories and totals

## Tips for Clean Imports

1. **Clean your data first** - Remove test records, duplicates, and outdated entries before exporting
2. **Use consistent formats** - Ensure dates, amounts, and phone numbers follow consistent patterns
3. **Export one type at a time** - Import customers first, then invoices, then payments
4. **Keep your CSV files** - Save the exported files in case you need to re-import or reference original data
5. **Test with a small batch** - If you have thousands of records, consider importing a small subset first

## Support

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Verify your CSV file format matches Yardbook's export format
3. Review the import error messages for specific issues
4. Contact support with your CSV file and error message

## Data Mapping Reference

### CSV Column Names Expected from Yardbook

**Customers CSV:**
```
id, business_name, email, country, state, address_line1, address_line2, city,
zip_code, phone, mobile, fax, contact_first_name, contact_last_name, note,
discount, created_at, updated_at, payment_term, tax_rate_id,
invoice_delivery_preference, customer_source, referred_by,
email_customer_when_job_is_completed, tags, is_prospect, job_desc,
primary_customer_stripe_reference_id, auto_invoice_merge_setting,
inactive_starting_on, latitude, longitude, disable_payment_reminders,
oppty_status, skip_job_auto_inv
```

**Invoices CSV:**
```
id, customer_id, amount, invoice_date, due_date, status, invoice_number,
total, discount, tax, paid_date, message, comment, type, created_at, updated_at
```

**Payments CSV:**
```
id, amount, date_paid, payment_method, category, customer_name, note, created_at, updated_at
```

**Expenses CSV:**
```
id, amount, expense_date, paid_to, category, payment_method, check_number, note,
created_at, updated_at, attachment_file_name
```

---

Last updated: 2026-03-01
Version: 1.0
