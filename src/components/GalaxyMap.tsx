'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Galaxy, Player, System } from '@/game/types';
import { drawStars, drawRoutes, drawSystems, drawSystemTooltip } from '@/game/Renderer';
import { getMarketPrices } from '@/game/Market';
import { COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants';
import { getDistance } from '@/game/Galaxy';

interface GalaxyMapProps {
  galaxy: Galaxy;
  player: Player;
  selectedSystem: string | null;
  reachableSystems: System[];
  distanceToSelected: number | null;
  canJump: boolean;
  onSelectSystem: (systemId: string | null) => void;
  onJump: () => void;
  onBack: () => void;
}

export function GalaxyMap({
  galaxy,
  player,
  selectedSystem,
  reachableSystems,
  distanceToSelected,
  canJump,
  onSelectSystem,
  onJump,
  onBack,
}: GalaxyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Map transform constants (must match rendering)
  const scale = 1.8;
  const offsetX = 50;
  const offsetY = 100;

  // Get selected system info
  const selected = selectedSystem ? galaxy.systems.find(s => s.id === selectedSystem) : null;
  const isReachable = selected ? reachableSystems.some(s => s.id === selected.id) : false;
  const selectedMarket = selected ? getMarketPrices(selected) : null;

  // Render map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    drawStars(ctx);
    
    drawRoutes(ctx, galaxy.routes, galaxy.systems, offsetX, offsetY, scale);
    drawSystems(ctx, galaxy.systems, player.location, selectedSystem, offsetX, offsetY, scale);
    
    // Title
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GALAXY MAP', CANVAS_WIDTH / 2, 30);

    // Draw hover tooltip
    if (hoveredSystem && mousePos) {
      const hovered = galaxy.systems.find(s => s.id === hoveredSystem);
      if (hovered) {
        const dist = getDistance(galaxy, player.location, hovered.id);
        const canReachHovered = dist !== null && dist <= player.ship.fuel;
        drawSystemTooltip(ctx, hovered, dist, canReachHovered, mousePos.x + 15, mousePos.y + 15);
      }
    }
  }, [galaxy, player.location, player.ship.fuel, selectedSystem, hoveredSystem, mousePos, scale, offsetX, offsetY]);

  // Handle canvas click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near a system (using transformed coordinates)
    for (const system of galaxy.systems) {
      const sysX = system.x * scale + offsetX;
      const sysY = system.y * scale + offsetY;
      const dx = sysX - x;
      const dy = sysY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20) {
        onSelectSystem(system.id === selectedSystem ? null : system.id);
        return;
      }
    }

    // Clicked empty space - deselect
    onSelectSystem(null);
  }, [galaxy.systems, selectedSystem, onSelectSystem, scale, offsetX, offsetY]);

  // Handle mouse move for hover tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Check if hovering over a system
    for (const system of galaxy.systems) {
      const sysX = system.x * scale + offsetX;
      const sysY = system.y * scale + offsetY;
      const dx = sysX - x;
      const dy = sysY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20) {
        setHoveredSystem(system.id);
        return;
      }
    }

    setHoveredSystem(null);
  }, [galaxy.systems, scale, offsetX, offsetY]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredSystem(null);
    setMousePos(null);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
        <h1 className="text-xl font-bold text-white">Galaxy Map</h1>
        <div className="flex gap-2">
          {selected && (
            <button
              onClick={onJump}
              disabled={!canJump}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded"
            >
              Jump to {selected.name}
            </button>
          )}
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Back to Station
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="bg-gray-900 rounded border border-gray-700 cursor-crosshair"
          />
        </div>

        <div className="w-64 bg-gray-900 p-4 rounded border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-3">System Info</h2>
          
          {selected ? (
            <div className="space-y-2 text-sm">
              <p className="text-white font-bold">{selected.name}</p>
              <p className="text-gray-400 capitalize">{selected.type} economy</p>
              {distanceToSelected !== null && (
                <>
                  <p className="text-gray-400">
                    Distance: {distanceToSelected.toFixed(1)} LY
                  </p>
                  <p className="text-gray-400">
                    Fuel required: {distanceToSelected.toFixed(1)} LY
                  </p>
                </>
              )}
              <p className={isReachable ? 'text-green-400' : 'text-red-400'}>
                {isReachable ? 'In range' : 'Out of range'}
              </p>

              {selectedMarket && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-400 font-bold mb-2">Market Prices</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left">Item</th>
                        <th className="text-right">Buy</th>
                        <th className="text-right">Sell</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-gray-300">Food</td>
                        <td className="text-right text-cyan-400">{selectedMarket.food.buy}</td>
                        <td className="text-right text-yellow-400">{selectedMarket.food.sell}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-300">Minerals</td>
                        <td className="text-right text-cyan-400">{selectedMarket.minerals.buy}</td>
                        <td className="text-right text-yellow-400">{selectedMarket.minerals.sell}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-300">Computers</td>
                        <td className="text-right text-cyan-400">{selectedMarket.computers.buy}</td>
                        <td className="text-right text-yellow-400">{selectedMarket.computers.sell}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Click a system to select it</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Fuel: {player.ship.fuel.toFixed(1)} / {player.ship.maxFuel} LY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
