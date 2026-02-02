'use client';

import { useState, useCallback } from 'react';
import { Game, createGame } from '@/game/Game';
import { Commodity } from '@/game/types';
import { StationView } from './StationView';
import { GalaxyMap } from './GalaxyMap';

export function GameCanvas() {
  const [game] = useState<Game>(() => createGame());
  const [, forceUpdate] = useState({});

  // Force re-render after game state changes
  const refresh = useCallback(() => {
    forceUpdate({});
  }, []);

  // Get current state
  const state = game.getState();
  const player = game.getPlayer();
  const galaxy = game.getGalaxy();
  const currentSystem = game.getCurrentSystem();
  const market = game.getCurrentMarket();
  const reachableSystems = game.getReachableSystems();
  const distanceToSelected = game.getDistanceToSelected();
  const canJump = game.canJumpToSelected();

  // Handlers
  const handleBuy = useCallback((commodity: Commodity, quantity: number) => {
    const result = game.buy(commodity, quantity);
    if (!result.success && result.error) {
      console.log('Buy failed:', result.error);
    }
    refresh();
  }, [game, refresh]);

  const handleSell = useCallback((commodity: Commodity, quantity: number) => {
    const result = game.sell(commodity, quantity);
    if (!result.success && result.error) {
      console.log('Sell failed:', result.error);
    }
    refresh();
  }, [game, refresh]);

  const handleRefuel = useCallback(() => {
    const fuelNeeded = player.ship.maxFuel - player.ship.fuel;
    const result = game.refuel(fuelNeeded);
    if (!result.success && result.error) {
      console.log('Refuel failed:', result.error);
    }
    refresh();
  }, [game, player.ship, refresh]);

  const handleLaunch = useCallback(() => {
    game.setView('galaxy');
    refresh();
  }, [game, refresh]);

  const handleBack = useCallback(() => {
    game.setView('station');
    game.selectSystem(null);
    refresh();
  }, [game, refresh]);

  const handleSelectSystem = useCallback((systemId: string | null) => {
    game.selectSystem(systemId);
    refresh();
  }, [game, refresh]);

  const handleJump = useCallback(() => {
    if (!state.selectedSystem) return;
    const result = game.jump(state.selectedSystem);
    if (!result.success && result.error) {
      console.log('Jump failed:', result.error);
    }
    refresh();
  }, [game, state.selectedSystem, refresh]);

  return (
    <div className="w-full h-screen bg-black p-4">
      {state.view === 'station' && (
        <StationView
          player={player}
          market={market}
          system={currentSystem}
          onBuy={handleBuy}
          onSell={handleSell}
          onRefuel={handleRefuel}
          onLaunch={handleLaunch}
        />
      )}

      {state.view === 'galaxy' && (
        <GalaxyMap
          galaxy={galaxy}
          player={player}
          selectedSystem={state.selectedSystem}
          reachableSystems={reachableSystems}
          distanceToSelected={distanceToSelected}
          canJump={canJump}
          onSelectSystem={handleSelectSystem}
          onJump={handleJump}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
