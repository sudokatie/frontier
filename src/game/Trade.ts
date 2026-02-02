// Trade system for Frontier

import { Player, Commodity, CargoItem } from './types';
import { getCargoSpace } from './Ship';
import { addCargo, removeCargo, addCredits, spendCredits, getCargoQuantity } from './Player';

export interface TradeResult {
  success: boolean;
  player: Player;
  error?: string;
}

export function canBuy(
  player: Player,
  commodity: Commodity,
  quantity: number,
  price: number
): { valid: boolean; error?: string } {
  const totalCost = price * quantity;
  
  if (player.credits < totalCost) {
    return { valid: false, error: 'Not enough credits' };
  }
  
  const availableSpace = getCargoSpace(player.ship, player.cargo);
  if (quantity > availableSpace) {
    return { valid: false, error: 'Not enough cargo space' };
  }
  
  return { valid: true };
}

export function buy(
  player: Player,
  commodity: Commodity,
  quantity: number,
  price: number
): TradeResult {
  const check = canBuy(player, commodity, quantity, price);
  if (!check.valid) {
    return { success: false, player, error: check.error };
  }
  
  const totalCost = price * quantity;
  let updatedPlayer = spendCredits(player, totalCost);
  if (!updatedPlayer) {
    return { success: false, player, error: 'Failed to spend credits' };
  }
  
  updatedPlayer = addCargo(updatedPlayer, commodity, quantity, price);
  return { success: true, player: updatedPlayer };
}

export function canSell(
  player: Player,
  commodity: Commodity,
  quantity: number
): { valid: boolean; error?: string } {
  const owned = getCargoQuantity(player, commodity);
  
  if (owned < quantity) {
    return { valid: false, error: `Only have ${owned} units` };
  }
  
  return { valid: true };
}

export function sell(
  player: Player,
  commodity: Commodity,
  quantity: number,
  price: number
): TradeResult {
  const check = canSell(player, commodity, quantity);
  if (!check.valid) {
    return { success: false, player, error: check.error };
  }
  
  const totalRevenue = price * quantity;
  let updatedPlayer = removeCargo(player, commodity, quantity);
  updatedPlayer = addCredits(updatedPlayer, totalRevenue);
  
  return { success: true, player: updatedPlayer };
}

export function getMaxBuyable(
  player: Player,
  price: number
): number {
  if (price <= 0) return 0;
  
  const affordableByCredits = Math.floor(player.credits / price);
  const availableSpace = getCargoSpace(player.ship, player.cargo);
  
  return Math.min(affordableByCredits, availableSpace);
}

export function calculateProfit(cargo: CargoItem, sellPrice: number): number {
  return (sellPrice - cargo.purchasePrice) * cargo.quantity;
}

export function calculateProfitPerUnit(purchasePrice: number, sellPrice: number): number {
  return sellPrice - purchasePrice;
}
