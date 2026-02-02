import {
  canBuy,
  buy,
  canSell,
  sell,
  getMaxBuyable,
  calculateProfit,
  calculateProfitPerUnit,
} from '../game/Trade';
import { createPlayer, addCargo, addCredits } from '../game/Player';
import { STARTING_CREDITS, SHIP_CARGO_CAPACITY } from '../game/constants';

describe('Trade', () => {
  describe('canBuy', () => {
    it('returns valid with enough credits and space', () => {
      const player = createPlayer();
      const result = canBuy(player, 'food', 5, 10);
      expect(result.valid).toBe(true);
    });

    it('returns invalid without enough credits', () => {
      const player = createPlayer();
      const result = canBuy(player, 'food', 5, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('credits');
    });

    it('returns invalid without enough cargo space', () => {
      let player = createPlayer();
      player = addCargo(player, 'minerals', SHIP_CARGO_CAPACITY - 1, 10);
      const result = canBuy(player, 'food', 5, 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cargo');
    });
  });

  describe('buy', () => {
    it('reduces credits and adds cargo on success', () => {
      const player = createPlayer();
      const result = buy(player, 'food', 5, 10);
      expect(result.success).toBe(true);
      expect(result.player.credits).toBe(STARTING_CREDITS - 50);
      expect(result.player.cargo).toHaveLength(1);
      expect(result.player.cargo[0].quantity).toBe(5);
    });

    it('fails and returns original player on insufficient credits', () => {
      const player = createPlayer();
      const result = buy(player, 'food', 5, 1000);
      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
    });

    it('tracks purchase price', () => {
      const player = createPlayer();
      const result = buy(player, 'food', 5, 10);
      expect(result.player.cargo[0].purchasePrice).toBe(10);
    });
  });

  describe('canSell', () => {
    it('returns valid with enough cargo', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      const result = canSell(player, 'food', 3);
      expect(result.valid).toBe(true);
    });

    it('returns invalid without enough cargo', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 2, 10);
      const result = canSell(player, 'food', 5);
      expect(result.valid).toBe(false);
    });

    it('returns invalid for unowned commodity', () => {
      const player = createPlayer();
      const result = canSell(player, 'food', 1);
      expect(result.valid).toBe(false);
    });
  });

  describe('sell', () => {
    it('increases credits and removes cargo on success', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      const result = sell(player, 'food', 3, 15);
      expect(result.success).toBe(true);
      expect(result.player.credits).toBe(STARTING_CREDITS + 45);
      expect(result.player.cargo[0].quantity).toBe(2);
    });

    it('removes cargo item when selling all', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      const result = sell(player, 'food', 5, 15);
      expect(result.success).toBe(true);
      expect(result.player.cargo).toHaveLength(0);
    });

    it('fails when not owning enough', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 2, 10);
      const result = sell(player, 'food', 5, 15);
      expect(result.success).toBe(false);
    });
  });

  describe('getMaxBuyable', () => {
    it('limits by credits', () => {
      const player = createPlayer(); // 100 credits
      const max = getMaxBuyable(player, 30);
      expect(max).toBe(3); // Can afford 3 at 30 each
    });

    it('limits by cargo space', () => {
      let player = createPlayer();
      player = addCredits(player, 10000); // Plenty of credits
      const max = getMaxBuyable(player, 1);
      expect(max).toBe(SHIP_CARGO_CAPACITY);
    });

    it('accounts for existing cargo', () => {
      let player = createPlayer();
      player = addCredits(player, 10000);
      player = addCargo(player, 'minerals', 7, 10);
      const max = getMaxBuyable(player, 1);
      expect(max).toBe(SHIP_CARGO_CAPACITY - 7);
    });

    it('returns 0 for zero price', () => {
      const player = createPlayer();
      expect(getMaxBuyable(player, 0)).toBe(0);
    });
  });

  describe('calculateProfit', () => {
    it('calculates positive profit', () => {
      const cargo = { commodity: 'food' as const, quantity: 5, purchasePrice: 10 };
      const profit = calculateProfit(cargo, 15);
      expect(profit).toBe(25); // (15-10) * 5
    });

    it('calculates negative profit (loss)', () => {
      const cargo = { commodity: 'food' as const, quantity: 5, purchasePrice: 10 };
      const profit = calculateProfit(cargo, 8);
      expect(profit).toBe(-10); // (8-10) * 5
    });
  });

  describe('calculateProfitPerUnit', () => {
    it('calculates profit per unit', () => {
      expect(calculateProfitPerUnit(10, 15)).toBe(5);
    });

    it('returns negative for loss', () => {
      expect(calculateProfitPerUnit(10, 8)).toBe(-2);
    });
  });
});
