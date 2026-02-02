// Ship system for Frontier

import { Ship, CargoItem } from './types';
import { SHIP_MAX_FUEL, SHIP_CARGO_CAPACITY, FUEL_COST_PER_LY } from './constants';

export function createShip(): Ship {
  return {
    fuel: SHIP_MAX_FUEL,
    maxFuel: SHIP_MAX_FUEL,
    cargoCapacity: SHIP_CARGO_CAPACITY,
  };
}

export function consumeFuel(ship: Ship, distance: number): Ship {
  const newFuel = Math.max(0, ship.fuel - distance);
  return { ...ship, fuel: newFuel };
}

export function refuel(ship: Ship, amount: number): { ship: Ship; cost: number } {
  const fuelNeeded = ship.maxFuel - ship.fuel;
  const actualAmount = Math.min(amount, fuelNeeded);
  const cost = Math.ceil(actualAmount * FUEL_COST_PER_LY);
  
  return {
    ship: { ...ship, fuel: ship.fuel + actualAmount },
    cost,
  };
}

export function getCargoSpace(ship: Ship, cargo: CargoItem[]): number {
  const usedSpace = cargo.reduce((sum, item) => sum + item.quantity, 0);
  return ship.cargoCapacity - usedSpace;
}

export function getFuelCost(distance: number): number {
  return Math.ceil(distance * FUEL_COST_PER_LY);
}

export function canJump(ship: Ship, distance: number): boolean {
  return ship.fuel >= distance;
}

export function getFuelPercentage(ship: Ship): number {
  return (ship.fuel / ship.maxFuel) * 100;
}
