/**
 * CSV Column Mapper - Intelligently maps CSV columns to expected field names
 * Handles variations in column naming and formatting
 */

interface ColumnMapping {
  csvColumn: string;
  targetField: string;
  transform?: (value: string) => any;
}

/**
 * Find similar column names using fuzzy matching
 */
function findSimilarColumn(targetName: string, availableColumns: string[]): string | undefined {
  const normalized = targetName.toLowerCase().replace(/[_\s-]/g, "");

  for (const col of availableColumns) {
    const normalizedCol = col.toLowerCase().replace(/[_\s-]/g, "");

    // Exact match after normalization
    if (normalizedCol === normalized) return col;

    // Check if normalized names contain each other
    if (normalizedCol.includes(normalized) || normalized.includes(normalizedCol)) {
      return col;
    }

    // Levenshtein distance for fuzzy matching
    if (levenshteinDistance(normalized, normalizedCol) <= 3) {
      return col;
    }
  }

  return undefined;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Auto-map CSV columns to target fields
 */
export function autoMapColumns(
  csvHeaders: string[],
  expectedFields: string[]
): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const field of expectedFields) {
    const similarColumn = findSimilarColumn(field, csvHeaders);
    if (similarColumn) {
      mapping[field] = similarColumn;
    }
  }

  return mapping;
}

/**
 * Extract mapped values from a CSV row
 */
export function extractMappedValues(
  row: Record<string, string>,
  mapping: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [targetField, csvColumn] of Object.entries(mapping)) {
    result[targetField] = row[csvColumn] || "";
  }

  return result;
}

/**
 * Validate that required fields are present in CSV
 */
export function validateMappingCoverage(
  mapping: Record<string, string>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter((field) => !mapping[field]);

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Get suggested column mapping for Yardbook customers
 */
export function getSuggestedCustomerMapping(headers: string[]): Record<string, string> {
  return {
    name: headers.find((h) => findSimilarColumn("business_name", [h]) === h) || headers[0],
    email: headers.find((h) => findSimilarColumn("email", [h]) === h) || "",
    address: headers.find((h) => findSimilarColumn("address_line1", [h]) === h) || "",
    phone: headers.find((h) => findSimilarColumn("phone", [h]) === h) || "",
    contact_first_name: headers.find((h) => findSimilarColumn("contact_first_name", [h]) === h) || "",
    contact_last_name: headers.find((h) => findSimilarColumn("contact_last_name", [h]) === h) || ""
  };
}

/**
 * Get suggested column mapping for Yardbook invoices
 */
export function getSuggestedInvoiceMapping(headers: string[]): Record<string, string> {
  return {
    invoice_number: headers.find((h) => findSimilarColumn("invoice_number", [h]) === h) || "",
    amount: headers.find((h) => findSimilarColumn("amount", [h]) === h) || headers.find((h) => findSimilarColumn("total", [h]) === h) || "",
    invoice_date: headers.find((h) => findSimilarColumn("invoice_date", [h]) === h) || "",
    due_date: headers.find((h) => findSimilarColumn("due_date", [h]) === h) || "",
    status: headers.find((h) => findSimilarColumn("status", [h]) === h) || ""
  };
}

/**
 * Get suggested column mapping for Yardbook payments
 */
export function getSuggestedPaymentMapping(headers: string[]): Record<string, string> {
  return {
    amount: headers.find((h) => findSimilarColumn("amount", [h]) === h) || headers[0],
    payment_date: headers.find((h) => findSimilarColumn("payment_date", [h]) === h) || headers.find((h) => findSimilarColumn("date_paid", [h]) === h) || "",
    payment_method: headers.find((h) => findSimilarColumn("payment_method", [h]) === h) || "",
    category: headers.find((h) => findSimilarColumn("category", [h]) === h) || ""
  };
}

/**
 * Get suggested column mapping for Yardbook expenses
 */
export function getSuggestedExpenseMapping(headers: string[]): Record<string, string> {
  return {
    amount: headers.find((h) => findSimilarColumn("amount", [h]) === h) || headers[0],
    expense_date: headers.find((h) => findSimilarColumn("expense_date", [h]) === h) || "",
    category: headers.find((h) => findSimilarColumn("category", [h]) === h) || "",
    paid_to: headers.find((h) => findSimilarColumn("paid_to", [h]) === h) || "",
    payment_method: headers.find((h) => findSimilarColumn("payment_method", [h]) === h) || ""
  };
}
