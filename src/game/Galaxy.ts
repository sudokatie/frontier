// Galaxy system for Frontier

import { Galaxy, System, Route } from './types';
import { SYSTEMS, ROUTES } from './constants';

export function createGalaxy(): Galaxy {
  return {
    systems: [...SYSTEMS],
    routes: [...ROUTES],
  };
}

export function getSystem(galaxy: Galaxy, id: string): System | undefined {
  return galaxy.systems.find(s => s.id === id);
}

export function getRoutes(galaxy: Galaxy, systemId: string): Route[] {
  return galaxy.routes.filter(r => r.from === systemId || r.to === systemId);
}

export function getDistance(galaxy: Galaxy, from: string, to: string): number | null {
  const route = galaxy.routes.find(
    r => (r.from === from && r.to === to) || (r.from === to && r.to === from)
  );
  return route ? route.distance : null;
}

export function canReach(galaxy: Galaxy, from: string, to: string, fuel: number): boolean {
  const distance = getDistance(galaxy, from, to);
  if (distance === null) return false;
  return fuel >= distance;
}

export function getConnectedSystems(galaxy: Galaxy, systemId: string): System[] {
  const routes = getRoutes(galaxy, systemId);
  const connectedIds = routes.map(r => r.from === systemId ? r.to : r.from);
  return connectedIds
    .map(id => getSystem(galaxy, id))
    .filter((s): s is System => s !== undefined);
}

export function getReachableSystems(galaxy: Galaxy, systemId: string, fuel: number): System[] {
  return getConnectedSystems(galaxy, systemId).filter(system => {
    const distance = getDistance(galaxy, systemId, system.id);
    return distance !== null && distance <= fuel;
  });
}
