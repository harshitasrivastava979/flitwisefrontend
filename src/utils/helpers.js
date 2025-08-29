// Add reusable helper functions here
 
export function formatCurrency(amount) {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return `₹${value.toFixed(2)}`;
} 