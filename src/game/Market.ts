// Market system for Frontier

import { Commodity, SystemType, MarketPrices, System } from './types';
import { BASE_PRICES, PRICE_VARIANCE } from './constants';

// Simple seeded random for deterministic variance
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to 0-1 range
  return Math.abs(Math.sin(hash)) % 1;
}

export function getPriceVariance(systemId: string, commodity: Commodity): number {
  const seed = `${systemId}-${commodity}`;
  const random = seededRandom(seed);
  // Convert 0-1 to -VARIANCE to +VARIANCE
  return (random * 2 - 1) * PRICE_VARIANCE;
}

export function getBasePrice(commodity: Commodity, systemType: SystemType): { buy: number; sell: number } {
  return BASE_PRICES[systemType][commodity];
}

export function getMarketPrices(system: System): MarketPrices {
  const commodities: Commodity[] = ['food', 'minerals', 'computers'];
  const prices: Partial<MarketPrices> = {};

  for (const commodity of commodities) {
    const base = getBasePrice(commodity, system.type);
    const variance = getPriceVariance(system.id, commodity);
    
    prices[commodity] = {
      buy: Math.round(base.buy * (1 + variance)),
      sell: Math.round(base.sell * (1 + variance)),
    };
  }

  return prices as MarketPrices;
}

export function formatCredits(amount: number): string {
  return `${amount.toLocaleString()} cr`;
}

export function calculateProfitMargin(buyPrice: number, sellPrice: number): number {
  if (buyPrice === 0) return 0;
  return ((sellPrice - buyPrice) / buyPrice) * 100;
}
