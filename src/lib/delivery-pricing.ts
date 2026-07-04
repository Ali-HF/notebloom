/**
 * Delivery pricing utility for Notebloom.
 * Shipping origin: Karachi, Pakistan.
 *
 * Rates are tiered by total cart weight and destination city.
 * Safe for client-side import (no Node.js dependencies).
 */

const KARACHI_CITIES = ["karachi"];

type DeliveryMethod = "standard" | "express";

interface DeliveryRate {
  basePKR: number;       // Base rate for up to 500g
  perExtraHalfKgPKR: number; // Additional cost per extra 500g block
}

const RATES: Record<"local" | "nationwide", Record<DeliveryMethod, DeliveryRate>> = {
  local: {
    standard: { basePKR: 150, perExtraHalfKgPKR: 30 },
    express:  { basePKR: 350, perExtraHalfKgPKR: 50 },
  },
  nationwide: {
    standard: { basePKR: 250, perExtraHalfKgPKR: 50 },
    express:  { basePKR: 500, perExtraHalfKgPKR: 80 },
  },
};

/**
 * Calculate delivery cost in PKR (whole number, not cents).
 *
 * @param totalWeightGrams - Total weight of all cart items in grams
 * @param city - Customer's selected city
 * @param method - "standard" or "express"
 * @returns Delivery cost in PKR
 */
export function calculateDelivery(
  totalWeightGrams: number,
  city: string,
  method: DeliveryMethod
): number {
  const zone = KARACHI_CITIES.includes(city.toLowerCase().trim()) ? "local" : "nationwide";
  const rate = RATES[zone][method];

  // Base rate covers the first 500g
  const extraGrams = Math.max(0, totalWeightGrams - 500);
  const extraBlocks = Math.ceil(extraGrams / 500);

  return rate.basePKR + extraBlocks * rate.perExtraHalfKgPKR;
}

/**
 * Get both standard and express prices for display in the checkout UI.
 */
export function getDeliveryOptions(totalWeightGrams: number, city: string) {
  return {
    standard: calculateDelivery(totalWeightGrams, city, "standard"),
    express: calculateDelivery(totalWeightGrams, city, "express"),
  };
}

/**
 * Format weight for display.
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toFixed(kg % 1 === 0 ? 0 : 1)} kg`;
  }
  return `${grams}g`;
}
