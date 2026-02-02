import {
  createPlayer,
  addCargo,
  removeCargo,
  addCredits,
  spendCredits,
  movePlayer,
  updateShip,
  getCargoValue,
  getCargoQuantity,
  getTotalWealth,
} from '../game/Player';
import { MarketPrices } from '../game/types';
import { STARTING_CREDITS, STARTING_LOCATION } from '../game/constants';

describe('Player', () => {
  describe('createPlayer', () => {
    it('starts at correct location', () => {
      const player = createPlayer();
      expect(player.location).toBe(STARTING_LOCATION);
    });

    it('starts with correct credits', () => {
      const player = createPlayer();
      expect(player.credits).toBe(STARTING_CREDITS);
    });

    it('starts with empty cargo', () => {
      const player = createPlayer();
      expect(player.cargo).toHaveLength(0);
    });

    it('starts with a ship', () => {
      const player = createPlayer();
      expect(player.ship).toBeDefined();
      expect(player.ship.fuel).toBeGreaterThan(0);
    });
  });

  describe('addCargo', () => {
    it('adds new cargo item', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      expect(player.cargo).toHaveLength(1);
      expect(player.cargo[0].commodity).toBe('food');
      expect(player.cargo[0].quantity).toBe(5);
    });

    it('combines same commodity', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 3, 10);
      player = addCargo(player, 'food', 2, 10);
      expect(player.cargo).toHaveLength(1);
      expect(player.cargo[0].quantity).toBe(5);
    });

    it('averages purchase price when combining', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 2, 10); // 2 @ 10
      player = addCargo(player, 'food', 2, 20); // 2 @ 20
      // Average: (2*10 + 2*20) / 4 = 60/4 = 15
      expect(player.cargo[0].purchasePrice).toBe(15);
    });

    it('tracks different commodities separately', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 3, 10);
      player = addCargo(player, 'minerals', 2, 15);
      expect(player.cargo).toHaveLength(2);
    });
  });

  describe('removeCargo', () => {
    it('reduces cargo quantity', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      player = removeCargo(player, 'food', 2);
      expect(player.cargo[0].quantity).toBe(3);
    });

    it('removes cargo item when quantity hits zero', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      player = removeCargo(player, 'food', 5);
      expect(player.cargo).toHaveLength(0);
    });

    it('removes cargo item when removing more than owned', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 3, 10);
      player = removeCargo(player, 'food', 10);
      expect(player.cargo).toHaveLength(0);
    });

    it('does nothing for commodity not owned', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 3, 10);
      player = removeCargo(player, 'minerals', 2);
      expect(player.cargo).toHaveLength(1);
    });
  });

  describe('addCredits', () => {
    it('increases credits', () => {
      let player = createPlayer();
      player = addCredits(player, 50);
      expect(player.credits).toBe(STARTING_CREDITS + 50);
    });
  });

  describe('spendCredits', () => {
    it('decreases credits', () => {
      const player = createPlayer();
      const result = spendCredits(player, 30);
      expect(result?.credits).toBe(STARTING_CREDITS - 30);
    });

    it('returns null when not enough credits', () => {
      const player = createPlayer();
      const result = spendCredits(player, STARTING_CREDITS + 1);
      expect(result).toBeNull();
    });

    it('allows spending exact amount', () => {
      const player = createPlayer();
      const result = spendCredits(player, STARTING_CREDITS);
      expect(result?.credits).toBe(0);
    });
  });

  describe('movePlayer', () => {
    it('updates location', () => {
      let player = createPlayer();
      player = movePlayer(player, 'diso');
      expect(player.location).toBe('diso');
    });
  });

  describe('updateShip', () => {
    it('updates ship', () => {
      let player = createPlayer();
      const newShip = { ...player.ship, fuel: 5 };
      player = updateShip(player, newShip);
      expect(player.ship.fuel).toBe(5);
    });
  });

  describe('getCargoValue', () => {
    const market: MarketPrices = {
      food: { buy: 10, sell: 8 },
      minerals: { buy: 20, sell: 15 },
      computers: { buy: 100, sell: 80 },
    };

    it('returns 0 for empty cargo', () => {
      const player = createPlayer();
      expect(getCargoValue(player, market)).toBe(0);
    });

    it('calculates value at sell price', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      expect(getCargoValue(player, market)).toBe(5 * 8);
    });

    it('sums multiple commodities', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      player = addCargo(player, 'minerals', 2, 20);
      expect(getCargoValue(player, market)).toBe(5 * 8 + 2 * 15);
    });
  });

  describe('getCargoQuantity', () => {
    it('returns 0 for commodity not owned', () => {
      const player = createPlayer();
      expect(getCargoQuantity(player, 'food')).toBe(0);
    });

    it('returns quantity of owned commodity', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      expect(getCargoQuantity(player, 'food')).toBe(5);
    });
  });

  describe('getTotalWealth', () => {
    const market: MarketPrices = {
      food: { buy: 10, sell: 8 },
      minerals: { buy: 20, sell: 15 },
      computers: { buy: 100, sell: 80 },
    };

    it('includes credits', () => {
      const player = createPlayer();
      expect(getTotalWealth(player, market)).toBe(STARTING_CREDITS);
    });

    it('includes cargo value', () => {
      let player = createPlayer();
      player = addCargo(player, 'food', 5, 10);
      expect(getTotalWealth(player, market)).toBe(STARTING_CREDITS + 5 * 8);
    });
  });
});
