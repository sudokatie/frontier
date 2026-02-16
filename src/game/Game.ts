// Game orchestrator for Frontier

import { GameState, GameView, Player, Galaxy, System, Commodity, MarketPrices } from './types';
import { createGalaxy, getSystem, getDistance, getReachableSystems, canReach } from './Galaxy';
import { createPlayer, movePlayer, updateShip, addCredits } from './Player';
import { getMarketPrices } from './Market';
import { consumeFuel, refuel as shipRefuel } from './Ship';
import { buy as tradeBuy, sell as tradeSell, TradeResult } from './Trade';
import { Sound } from './Sound';

export interface GameActions {
  buy: (commodity: Commodity, quantity: number) => TradeResult;
  sell: (commodity: Commodity, quantity: number) => TradeResult;
  jump: (systemId: string) => { success: boolean; error?: string };
  refuel: (amount: number) => { success: boolean; cost: number; error?: string };
  selectSystem: (systemId: string | null) => void;
  setView: (view: GameView) => void;
}

export class Game {
  private state: GameState;

  constructor() {
    const galaxy = createGalaxy();
    const player = createPlayer();
    
    this.state = {
      player,
      galaxy,
      view: 'station',
      selectedSystem: null,
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  getPlayer(): Player {
    return { ...this.state.player };
  }

  getGalaxy(): Galaxy {
    return this.state.galaxy;
  }

  getCurrentSystem(): System | undefined {
    return getSystem(this.state.galaxy, this.state.player.location);
  }

  getCurrentMarket(): MarketPrices | null {
    const system = this.getCurrentSystem();
    if (!system) return null;
    return getMarketPrices(system);
  }

  getReachableSystems(): System[] {
    return getReachableSystems(
      this.state.galaxy,
      this.state.player.location,
      this.state.player.ship.fuel
    );
  }

  buy(commodity: Commodity, quantity: number): TradeResult {
    const market = this.getCurrentMarket();
    if (!market) {
      return { success: false, player: this.state.player, error: 'No market available' };
    }
    
    const price = market[commodity].buy;
    const result = tradeBuy(this.state.player, commodity, quantity, price);
    
    if (result.success) {
      this.state.player = result.player;
      Sound.play('buy');
    } else {
      Sound.play('error');
    }
    
    return result;
  }

  sell(commodity: Commodity, quantity: number): TradeResult {
    const market = this.getCurrentMarket();
    if (!market) {
      return { success: false, player: this.state.player, error: 'No market available' };
    }
    
    const price = market[commodity].sell;
    const result = tradeSell(this.state.player, commodity, quantity, price);
    
    if (result.success) {
      this.state.player = result.player;
      Sound.play('sell');
    } else {
      Sound.play('error');
    }
    
    return result;
  }

  jump(systemId: string): { success: boolean; error?: string } {
    const distance = getDistance(this.state.galaxy, this.state.player.location, systemId);
    
    if (distance === null) {
      return { success: false, error: 'No route to that system' };
    }
    
    if (!canReach(this.state.galaxy, this.state.player.location, systemId, this.state.player.ship.fuel)) {
      return { success: false, error: 'Not enough fuel' };
    }
    
    // Consume fuel and move
    const newShip = consumeFuel(this.state.player.ship, distance);
    let newPlayer = updateShip(this.state.player, newShip);
    newPlayer = movePlayer(newPlayer, systemId);
    
    this.state.player = newPlayer;
    this.state.view = 'station';
    this.state.selectedSystem = null;
    Sound.play('jump');
    
    return { success: true };
  }

  refuel(amount: number): { success: boolean; cost: number; error?: string } {
    const { ship, cost } = shipRefuel(this.state.player.ship, amount);
    
    if (cost > this.state.player.credits) {
      return { success: false, cost: 0, error: 'Not enough credits' };
    }
    
    let newPlayer = updateShip(this.state.player, ship);
    newPlayer = addCredits(newPlayer, -cost);
    
    this.state.player = newPlayer;
    Sound.play('refuel');
    
    return { success: true, cost };
  }

  selectSystem(systemId: string | null): void {
    this.state.selectedSystem = systemId;
  }

  setView(view: GameView): void {
    this.state.view = view;
  }

  getSelectedSystem(): System | null {
    if (!this.state.selectedSystem) return null;
    return getSystem(this.state.galaxy, this.state.selectedSystem) || null;
  }

  getDistanceToSelected(): number | null {
    if (!this.state.selectedSystem) return null;
    return getDistance(this.state.galaxy, this.state.player.location, this.state.selectedSystem);
  }

  canJumpToSelected(): boolean {
    if (!this.state.selectedSystem) return false;
    return canReach(
      this.state.galaxy,
      this.state.player.location,
      this.state.selectedSystem,
      this.state.player.ship.fuel
    );
  }

  toggleSound(): boolean {
    const newState = !Sound.isEnabled();
    Sound.setEnabled(newState);
    return newState;
  }

  isSoundEnabled(): boolean {
    return Sound.isEnabled();
  }
}

export function createGame(): Game {
  return new Game();
}
