import {
  getPriceVariance,
  getBasePrice,
  getMarketPrices,
  formatCredits,
  calculateProfitMargin,
} from '../game/Market';
import { System } from '../game/types';
import { PRICE_VARIANCE } from '../game/constants';

describe('Market', () => {
  describe('getPriceVariance', () => {
    it('returns variance within bounds', () => {
      const variance = getPriceVariance('lave', 'food');
      expect(variance).toBeGreaterThanOrEqual(-PRICE_VARIANCE);
      expect(variance).toBeLessThanOrEqual(PRICE_VARIANCE);
    });

    it('returns same variance for same inputs (deterministic)', () => {
      const v1 = getPriceVariance('lave', 'food');
      const v2 = getPriceVariance('lave', 'food');
      expect(v1).toBe(v2);
    });

    it('returns different variance for different systems', () => {
      const v1 = getPriceVariance('lave', 'food');
      const v2 = getPriceVariance('diso', 'food');
      expect(v1).not.toBe(v2);
    });

    it('returns different variance for different commodities', () => {
      const v1 = getPriceVariance('lave', 'food');
      const v2 = getPriceVariance('lave', 'minerals');
      expect(v1).not.toBe(v2);
    });
  });

  describe('getBasePrice', () => {
    it('agricultural systems have cheap food', () => {
      const food = getBasePrice('food', 'agricultural');
      const indFood = getBasePrice('food', 'industrial');
      expect(food.buy).toBeLessThan(indFood.buy);
    });

    it('mining systems have cheap minerals', () => {
      const minerals = getBasePrice('minerals', 'mining');
      const techMinerals = getBasePrice('minerals', 'hightech');
      expect(minerals.buy).toBeLessThan(techMinerals.buy);
    });

    it('hightech systems have cheap computers', () => {
      const computers = getBasePrice('computers', 'hightech');
      const agriComputers = getBasePrice('computers', 'agricultural');
      expect(computers.buy).toBeLessThan(agriComputers.buy);
    });

    it('buy price is higher than sell price', () => {
      const food = getBasePrice('food', 'agricultural');
      expect(food.buy).toBeGreaterThan(food.sell);
    });
  });

  describe('getMarketPrices', () => {
    const laveSystem: System = {
      id: 'lave',
      name: 'Lave',
      type: 'agricultural',
      x: 200,
      y: 150,
    };

    it('returns prices for all commodities', () => {
      const prices = getMarketPrices(laveSystem);
      expect(prices.food).toBeDefined();
      expect(prices.minerals).toBeDefined();
      expect(prices.computers).toBeDefined();
    });

    it('returns buy and sell for each commodity', () => {
      const prices = getMarketPrices(laveSystem);
      expect(prices.food.buy).toBeDefined();
      expect(prices.food.sell).toBeDefined();
    });

    it('prices are rounded integers', () => {
      const prices = getMarketPrices(laveSystem);
      expect(Number.isInteger(prices.food.buy)).toBe(true);
      expect(Number.isInteger(prices.food.sell)).toBe(true);
    });

    it('same system returns same prices (deterministic)', () => {
      const p1 = getMarketPrices(laveSystem);
      const p2 = getMarketPrices(laveSystem);
      expect(p1.food.buy).toBe(p2.food.buy);
    });
  });

  describe('formatCredits', () => {
    it('formats small amounts', () => {
      expect(formatCredits(100)).toBe('100 cr');
    });

    it('formats large amounts with commas', () => {
      expect(formatCredits(1000000)).toBe('1,000,000 cr');
    });

    it('handles zero', () => {
      expect(formatCredits(0)).toBe('0 cr');
    });
  });

  describe('calculateProfitMargin', () => {
    it('calculates positive margin', () => {
      const margin = calculateProfitMargin(100, 150);
      expect(margin).toBe(50);
    });

    it('calculates negative margin', () => {
      const margin = calculateProfitMargin(100, 80);
      expect(margin).toBe(-20);
    });

    it('handles zero buy price', () => {
      const margin = calculateProfitMargin(0, 100);
      expect(margin).toBe(0);
    });
  });
});
