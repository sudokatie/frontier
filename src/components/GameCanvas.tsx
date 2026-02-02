'use client';

import { useState, useCallback, useEffect } from 'react';
import { Game, createGame } from '@/game/Game';
import { Commodity } from '@/game/types';
import { StationView } from './StationView';
import { GalaxyMap } from './GalaxyMap';
import { JumpScreen } from './JumpScreen';

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

  const [jumpTarget, setJumpTarget] = useState<string | null>(null);

  const handleJump = useCallback(() => {
    if (!state.selectedSystem) return;
    
    // Get target system name before jumping
    const targetSystem = galaxy.systems.find(s => s.id === state.selectedSystem);
    if (!targetSystem) return;

    // Start jump animation
    setJumpTarget(targetSystem.name);
    game.setView('jumping');
    refresh();
  }, [game, state.selectedSystem, galaxy.systems, refresh]);

  // Handle jump animation completion
  useEffect(() => {
    if (state.view === 'jumping' && jumpTarget) {
      const timer = setTimeout(() => {
        // Find the system id from the name
        const targetSystem = galaxy.systems.find(s => s.name === jumpTarget);
        if (targetSystem) {
          const result = game.jump(targetSystem.id);
          if (!result.success && result.error) {
            console.log('Jump failed:', result.error);
          }
        }
        setJumpTarget(null);
        refresh();
      }, 1500); // 1.5 second jump animation

      return () => clearTimeout(timer);
    }
  }, [state.view, jumpTarget, game, galaxy.systems, refresh]);

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

      {state.view === 'jumping' && jumpTarget && (
        <JumpScreen destination={jumpTarget} />
      )}
    </div>
  );
}
