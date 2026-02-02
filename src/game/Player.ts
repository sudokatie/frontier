// Player system for Frontier

import { Player, Commodity, MarketPrices, Ship } from './types';
import { STARTING_CREDITS, STARTING_LOCATION } from './constants';
import { createShip } from './Ship';

export function createPlayer(): Player {
  return {
    credits: STARTING_CREDITS,
    location: STARTING_LOCATION,
    ship: createShip(),
    cargo: [],
  };
}

export function addCargo(
  player: Player,
  commodity: Commodity,
  quantity: number,
  purchasePrice: number
): Player {
  const existingIndex = player.cargo.findIndex(c => c.commodity === commodity);
  
  if (existingIndex >= 0) {
    // Average the purchase price for existing cargo
    const existing = player.cargo[existingIndex];
    const totalQty = existing.quantity + quantity;
    const avgPrice = Math.round(
      (existing.purchasePrice * existing.quantity + purchasePrice * quantity) / totalQty
    );
    
    const newCargo = [...player.cargo];
    newCargo[existingIndex] = {
      commodity,
      quantity: totalQty,
      purchasePrice: avgPrice,
    };
    
    return { ...player, cargo: newCargo };
  }
  
  return {
    ...player,
    cargo: [...player.cargo, { commodity, quantity, purchasePrice }],
  };
}

export function removeCargo(
  player: Player,
  commodity: Commodity,
  quantity: number
): Player {
  const existingIndex = player.cargo.findIndex(c => c.commodity === commodity);
  if (existingIndex < 0) return player;
  
  const existing = player.cargo[existingIndex];
  const newQuantity = existing.quantity - quantity;
  
  if (newQuantity <= 0) {
    return {
      ...player,
      cargo: player.cargo.filter((_, i) => i !== existingIndex),
    };
  }
  
  const newCargo = [...player.cargo];
  newCargo[existingIndex] = { ...existing, quantity: newQuantity };
  return { ...player, cargo: newCargo };
}

export function addCredits(player: Player, amount: number): Player {
  return { ...player, credits: player.credits + amount };
}

export function spendCredits(player: Player, amount: number): Player | null {
  if (player.credits < amount) return null;
  return { ...player, credits: player.credits - amount };
}

export function movePlayer(player: Player, systemId: string): Player {
  return { ...player, location: systemId };
}

export function updateShip(player: Player, ship: Ship): Player {
  return { ...player, ship };
}

export function getCargoValue(player: Player, market: MarketPrices): number {
  return player.cargo.reduce((total, item) => {
    const sellPrice = market[item.commodity].sell;
    return total + sellPrice * item.quantity;
  }, 0);
}

export function getCargoQuantity(player: Player, commodity: Commodity): number {
  const item = player.cargo.find(c => c.commodity === commodity);
  return item ? item.quantity : 0;
}

export function getTotalWealth(player: Player, market: MarketPrices): number {
  return player.credits + getCargoValue(player, market);
}
