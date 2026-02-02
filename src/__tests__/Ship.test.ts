import {
  createShip,
  consumeFuel,
  refuel,
  getCargoSpace,
  getFuelCost,
  canJump,
  getFuelPercentage,
} from '../game/Ship';
import { CargoItem } from '../game/types';
import { SHIP_MAX_FUEL, SHIP_CARGO_CAPACITY, FUEL_COST_PER_LY } from '../game/constants';

describe('Ship', () => {
  describe('createShip', () => {
    it('creates ship with max fuel', () => {
      const ship = createShip();
      expect(ship.fuel).toBe(SHIP_MAX_FUEL);
    });

    it('creates ship with correct max fuel', () => {
      const ship = createShip();
      expect(ship.maxFuel).toBe(SHIP_MAX_FUEL);
    });

    it('creates ship with correct cargo capacity', () => {
      const ship = createShip();
      expect(ship.cargoCapacity).toBe(SHIP_CARGO_CAPACITY);
    });
  });

  describe('consumeFuel', () => {
    it('reduces fuel by distance', () => {
      const ship = createShip();
      const updated = consumeFuel(ship, 3);
      expect(updated.fuel).toBe(SHIP_MAX_FUEL - 3);
    });

    it('does not reduce below zero', () => {
      const ship = createShip();
      const updated = consumeFuel(ship, 100);
      expect(updated.fuel).toBe(0);
    });

    it('does not mutate original ship', () => {
      const ship = createShip();
      const originalFuel = ship.fuel;
      consumeFuel(ship, 3);
      expect(ship.fuel).toBe(originalFuel);
    });
  });

  describe('refuel', () => {
    it('increases fuel', () => {
      let ship = createShip();
      ship = consumeFuel(ship, 5);
      const { ship: refueled } = refuel(ship, 3);
      expect(refueled.fuel).toBe(SHIP_MAX_FUEL - 5 + 3);
    });

    it('does not exceed max fuel', () => {
      let ship = createShip();
      ship = consumeFuel(ship, 2);
      const { ship: refueled } = refuel(ship, 10);
      expect(refueled.fuel).toBe(SHIP_MAX_FUEL);
    });

    it('returns correct cost', () => {
      let ship = createShip();
      ship = consumeFuel(ship, 5);
      const { cost } = refuel(ship, 3);
      expect(cost).toBe(Math.ceil(3 * FUEL_COST_PER_LY));
    });

    it('only charges for fuel actually added', () => {
      let ship = createShip();
      ship = consumeFuel(ship, 2);
      const { cost } = refuel(ship, 10);
      expect(cost).toBe(Math.ceil(2 * FUEL_COST_PER_LY));
    });
  });

  describe('getCargoSpace', () => {
    it('returns full capacity with empty cargo', () => {
      const ship = createShip();
      const space = getCargoSpace(ship, []);
      expect(space).toBe(SHIP_CARGO_CAPACITY);
    });

    it('subtracts cargo quantity', () => {
      const ship = createShip();
      const cargo: CargoItem[] = [
        { commodity: 'food', quantity: 3, purchasePrice: 10 },
      ];
      const space = getCargoSpace(ship, cargo);
      expect(space).toBe(SHIP_CARGO_CAPACITY - 3);
    });

    it('handles multiple cargo items', () => {
      const ship = createShip();
      const cargo: CargoItem[] = [
        { commodity: 'food', quantity: 3, purchasePrice: 10 },
        { commodity: 'minerals', quantity: 2, purchasePrice: 15 },
      ];
      const space = getCargoSpace(ship, cargo);
      expect(space).toBe(SHIP_CARGO_CAPACITY - 5);
    });
  });

  describe('getFuelCost', () => {
    it('calculates cost for distance', () => {
      const cost = getFuelCost(5);
      expect(cost).toBe(Math.ceil(5 * FUEL_COST_PER_LY));
    });

    it('rounds up fractional costs', () => {
      const cost = getFuelCost(3.1);
      expect(cost).toBe(Math.ceil(3.1 * FUEL_COST_PER_LY));
    });
  });

  describe('canJump', () => {
    it('returns true with enough fuel', () => {
      const ship = createShip();
      expect(canJump(ship, 5)).toBe(true);
    });

    it('returns false with insufficient fuel', () => {
      let ship = createShip();
      ship = consumeFuel(ship, 8);
      expect(canJump(ship, 5)).toBe(false);
    });

    it('returns true with exact fuel', () => {
      const ship = createShip();
      expect(canJump(ship, SHIP_MAX_FUEL)).toBe(true);
    });
  });

  describe('getFuelPercentage', () => {
    it('returns 100 for full tank', () => {
      const ship = createShip();
      expect(getFuelPercentage(ship)).toBe(100);
    });

    it('returns 50 for half tank', () => {
      let ship = createShip();
      ship = consumeFuel(ship, SHIP_MAX_FUEL / 2);
      expect(getFuelPercentage(ship)).toBe(50);
    });

    it('returns 0 for empty tank', () => {
      let ship = createShip();
      ship = consumeFuel(ship, SHIP_MAX_FUEL);
      expect(getFuelPercentage(ship)).toBe(0);
    });
  });
});
