// Simple function to escape single quotes for SQL queries
export function sanitizeInput(input) {
  if (!input) return;
  return input.replace(/'/g, "''");
}
