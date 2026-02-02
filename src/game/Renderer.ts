// Renderer for Frontier

import { Galaxy, System, Player, Route } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants';

export function drawStars(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw sparse stars
  ctx.fillStyle = '#ffffff';
  const starCount = 50;
  // Use fixed seed for consistent stars
  for (let i = 0; i < starCount; i++) {
    const x = (i * 137 + 23) % CANVAS_WIDTH;
    const y = (i * 89 + 41) % CANVAS_HEIGHT;
    const size = (i % 3) + 1;
    ctx.globalAlpha = 0.3 + (i % 5) * 0.15;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

export function getSystemColor(systemType: string): string {
  switch (systemType) {
    case 'agricultural': return COLORS.agricultural;
    case 'industrial': return COLORS.industrial;
    case 'mining': return COLORS.mining;
    case 'hightech': return COLORS.hightech;
    default: return '#888888';
  }
}

export function drawRoutes(
  ctx: CanvasRenderingContext2D,
  routes: Route[],
  systems: System[],
  offsetX: number,
  offsetY: number,
  scale: number
): void {
  ctx.strokeStyle = COLORS.routes;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  for (const route of routes) {
    const from = systems.find(s => s.id === route.from);
    const to = systems.find(s => s.id === route.to);
    if (!from || !to) continue;
    
    ctx.beginPath();
    ctx.moveTo(from.x * scale + offsetX, from.y * scale + offsetY);
    ctx.lineTo(to.x * scale + offsetX, to.y * scale + offsetY);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
}

export function drawSystems(
  ctx: CanvasRenderingContext2D,
  systems: System[],
  playerLocation: string,
  selectedSystem: string | null,
  offsetX: number,
  offsetY: number,
  scale: number
): void {
  for (const system of systems) {
    const x = system.x * scale + offsetX;
    const y = system.y * scale + offsetY;
    const radius = system.id === playerLocation ? 12 : 8;
    
    // System circle
    ctx.fillStyle = getSystemColor(system.type);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Selection ring
    if (system.id === selectedSystem) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Player marker
    if (system.id === playerLocation) {
      ctx.fillStyle = COLORS.player;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // System name
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(system.name, x, y + radius + 16);
  }
}

export function drawSystemTooltip(
  ctx: CanvasRenderingContext2D,
  system: System,
  distance: number | null,
  canReach: boolean,
  x: number,
  y: number
): void {
  const padding = 10;
  const lineHeight = 18;
  const width = 150;
  const height = 80;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = '#444444';
  ctx.strokeRect(x, y, width, height);
  
  // Content
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(system.name, x + padding, y + padding + 12);
  
  ctx.font = '12px monospace';
  ctx.fillStyle = getSystemColor(system.type);
  ctx.fillText(system.type, x + padding, y + padding + 12 + lineHeight);
  
  if (distance !== null) {
    ctx.fillStyle = canReach ? '#88ff88' : '#ff8888';
    ctx.fillText(`${distance.toFixed(1)} LY`, x + padding, y + padding + 12 + lineHeight * 2);
  }
}

export function drawGalaxyMap(
  ctx: CanvasRenderingContext2D,
  galaxy: Galaxy,
  player: Player,
  selectedSystem: string | null
): void {
  drawStars(ctx);
  
  // Calculate offset to center the map
  const scale = 1.8;
  const offsetX = 50;
  const offsetY = 100;
  
  drawRoutes(ctx, galaxy.routes, galaxy.systems, offsetX, offsetY, scale);
  drawSystems(ctx, galaxy.systems, player.location, selectedSystem, offsetX, offsetY, scale);
  
  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GALAXY MAP', CANVAS_WIDTH / 2, 40);
  
  // Instructions
  ctx.font = '12px monospace';
  ctx.fillText('Click system to select | JUMP to travel | ESC to return', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
}

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  player: Player,
  systemName: string
): void {
  const padding = 10;
  const barWidth = 150;
  const barHeight = 16;
  
  // Background panel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 60);
  
  // Location
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`STATION: ${systemName.toUpperCase()}`, padding, 25);
  
  // Credits
  ctx.font = '14px monospace';
  ctx.fillText(`Credits: ${player.credits.toLocaleString()} cr`, padding, 48);
  
  // Fuel bar
  const fuelX = CANVAS_WIDTH - barWidth - padding - 80;
  ctx.fillText('Fuel:', fuelX - 50, 25);
  
  ctx.fillStyle = '#333333';
  ctx.fillRect(fuelX, 12, barWidth, barHeight);
  
  const fuelPercent = player.ship.fuel / player.ship.maxFuel;
  ctx.fillStyle = fuelPercent > 0.3 ? '#22aa22' : '#aa2222';
  ctx.fillRect(fuelX, 12, barWidth * fuelPercent, barHeight);
  
  ctx.strokeStyle = '#666666';
  ctx.strokeRect(fuelX, 12, barWidth, barHeight);
  
  ctx.fillStyle = COLORS.text;
  ctx.fillText(`${player.ship.fuel.toFixed(1)}/${player.ship.maxFuel} LY`, fuelX + barWidth + 10, 25);
  
  // Cargo
  const cargoUsed = player.cargo.reduce((sum, c) => sum + c.quantity, 0);
  ctx.fillText(`Cargo: ${cargoUsed}/${player.ship.cargoCapacity}`, fuelX - 50, 48);
}
