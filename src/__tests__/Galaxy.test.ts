import {
  createGalaxy,
  getSystem,
  getRoutes,
  getDistance,
  canReach,
  getConnectedSystems,
  getReachableSystems,
} from '../game/Galaxy';
import { SYSTEMS, ROUTES } from '../game/constants';

describe('Galaxy', () => {
  describe('createGalaxy', () => {
    it('creates galaxy with all systems', () => {
      const galaxy = createGalaxy();
      expect(galaxy.systems).toHaveLength(SYSTEMS.length);
    });

    it('creates galaxy with all routes', () => {
      const galaxy = createGalaxy();
      expect(galaxy.routes).toHaveLength(ROUTES.length);
    });
  });

  describe('getSystem', () => {
    it('finds system by id', () => {
      const galaxy = createGalaxy();
      const system = getSystem(galaxy, 'lave');
      expect(system).toBeDefined();
      expect(system?.name).toBe('Lave');
    });

    it('returns undefined for unknown id', () => {
      const galaxy = createGalaxy();
      const system = getSystem(galaxy, 'nonexistent');
      expect(system).toBeUndefined();
    });
  });

  describe('getRoutes', () => {
    it('returns routes from a system', () => {
      const galaxy = createGalaxy();
      const routes = getRoutes(galaxy, 'lave');
      expect(routes.length).toBeGreaterThan(0);
    });

    it('includes routes where system is destination', () => {
      const galaxy = createGalaxy();
      // Leesti has route TO zaonce
      const routes = getRoutes(galaxy, 'leesti');
      const hasZaonceRoute = routes.some(r => r.from === 'zaonce' || r.to === 'zaonce');
      expect(hasZaonceRoute).toBe(true);
    });
  });

  describe('getDistance', () => {
    it('returns distance for valid route', () => {
      const galaxy = createGalaxy();
      const distance = getDistance(galaxy, 'lave', 'leesti');
      expect(distance).toBe(3.1);
    });

    it('returns distance regardless of direction', () => {
      const galaxy = createGalaxy();
      const distance1 = getDistance(galaxy, 'lave', 'leesti');
      const distance2 = getDistance(galaxy, 'leesti', 'lave');
      expect(distance1).toBe(distance2);
    });

    it('returns null for non-connected systems', () => {
      const galaxy = createGalaxy();
      // Riedquat only connects to Lave
      const distance = getDistance(galaxy, 'riedquat', 'zaonce');
      expect(distance).toBeNull();
    });
  });

  describe('canReach', () => {
    it('returns true with sufficient fuel', () => {
      const galaxy = createGalaxy();
      expect(canReach(galaxy, 'lave', 'leesti', 5)).toBe(true);
    });

    it('returns false with insufficient fuel', () => {
      const galaxy = createGalaxy();
      expect(canReach(galaxy, 'lave', 'leesti', 2)).toBe(false);
    });

    it('returns false for non-connected systems', () => {
      const galaxy = createGalaxy();
      expect(canReach(galaxy, 'riedquat', 'zaonce', 100)).toBe(false);
    });

    it('returns true with exact fuel needed', () => {
      const galaxy = createGalaxy();
      expect(canReach(galaxy, 'lave', 'leesti', 3.1)).toBe(true);
    });
  });

  describe('getConnectedSystems', () => {
    it('returns connected systems', () => {
      const galaxy = createGalaxy();
      const connected = getConnectedSystems(galaxy, 'lave');
      expect(connected.length).toBe(4); // Lave connects to 4 systems
    });

    it('returns System objects', () => {
      const galaxy = createGalaxy();
      const connected = getConnectedSystems(galaxy, 'lave');
      expect(connected[0]).toHaveProperty('name');
      expect(connected[0]).toHaveProperty('type');
    });
  });

  describe('getReachableSystems', () => {
    it('filters by fuel', () => {
      const galaxy = createGalaxy();
      const reachable = getReachableSystems(galaxy, 'lave', 4);
      // Leesti (3.1), Zaonce (4.0) reachable, Diso (4.2), Riedquat (5.5) not
      expect(reachable.length).toBe(2);
    });

    it('returns all connected with max fuel', () => {
      const galaxy = createGalaxy();
      const reachable = getReachableSystems(galaxy, 'lave', 10);
      expect(reachable.length).toBe(4);
    });

    it('returns empty with zero fuel', () => {
      const galaxy = createGalaxy();
      const reachable = getReachableSystems(galaxy, 'lave', 0);
      expect(reachable.length).toBe(0);
    });
  });
});
