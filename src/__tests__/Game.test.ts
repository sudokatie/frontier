import { Game, createGame } from '../game/Game';
import { STARTING_CREDITS, STARTING_LOCATION, SHIP_MAX_FUEL } from '../game/constants';

describe('Game', () => {
  describe('initialization', () => {
    it('creates game with player at starting location', () => {
      const game = createGame();
      expect(game.getPlayer().location).toBe(STARTING_LOCATION);
    });

    it('creates game with starting credits', () => {
      const game = createGame();
      expect(game.getPlayer().credits).toBe(STARTING_CREDITS);
    });

    it('creates game with full fuel', () => {
      const game = createGame();
      expect(game.getPlayer().ship.fuel).toBe(SHIP_MAX_FUEL);
    });

    it('creates game with galaxy', () => {
      const game = createGame();
      expect(game.getGalaxy().systems.length).toBeGreaterThan(0);
    });

    it('starts in station view', () => {
      const game = createGame();
      expect(game.getState().view).toBe('station');
    });
  });

  describe('getCurrentSystem', () => {
    it('returns current system', () => {
      const game = createGame();
      const system = game.getCurrentSystem();
      expect(system?.id).toBe(STARTING_LOCATION);
    });
  });

  describe('getCurrentMarket', () => {
    it('returns market prices for current system', () => {
      const game = createGame();
      const market = game.getCurrentMarket();
      expect(market).not.toBeNull();
      expect(market?.food).toBeDefined();
      expect(market?.minerals).toBeDefined();
      expect(market?.computers).toBeDefined();
    });
  });

  describe('getReachableSystems', () => {
    it('returns systems within fuel range', () => {
      const game = createGame();
      const reachable = game.getReachableSystems();
      expect(reachable.length).toBeGreaterThan(0);
    });
  });

  describe('buy', () => {
    it('buys commodity and reduces credits', () => {
      const game = createGame();
      const market = game.getCurrentMarket()!;
      const initialCredits = game.getPlayer().credits;
      
      const result = game.buy('food', 2);
      
      expect(result.success).toBe(true);
      expect(game.getPlayer().credits).toBe(initialCredits - market.food.buy * 2);
    });

    it('adds commodity to cargo', () => {
      const game = createGame();
      game.buy('food', 3);
      
      const cargo = game.getPlayer().cargo;
      expect(cargo.length).toBe(1);
      expect(cargo[0].commodity).toBe('food');
      expect(cargo[0].quantity).toBe(3);
    });

    it('fails when not enough credits', () => {
      const game = createGame();
      const result = game.buy('computers', 100);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('credits');
    });
  });

  describe('sell', () => {
    it('sells commodity and increases credits', () => {
      const game = createGame();
      game.buy('food', 5);
      const creditsAfterBuy = game.getPlayer().credits;
      const market = game.getCurrentMarket()!;
      
      const result = game.sell('food', 3);
      
      expect(result.success).toBe(true);
      expect(game.getPlayer().credits).toBe(creditsAfterBuy + market.food.sell * 3);
    });

    it('removes commodity from cargo', () => {
      const game = createGame();
      game.buy('food', 5);
      game.sell('food', 3);
      
      const cargo = game.getPlayer().cargo;
      expect(cargo[0].quantity).toBe(2);
    });

    it('fails when not enough cargo', () => {
      const game = createGame();
      const result = game.sell('food', 1);
      
      expect(result.success).toBe(false);
    });
  });

  describe('jump', () => {
    it('moves player to new system', () => {
      const game = createGame();
      const reachable = game.getReachableSystems();
      const target = reachable[0];
      
      const result = game.jump(target.id);
      
      expect(result.success).toBe(true);
      expect(game.getPlayer().location).toBe(target.id);
    });

    it('consumes fuel based on distance', () => {
      const game = createGame();
      const initialFuel = game.getPlayer().ship.fuel;
      const reachable = game.getReachableSystems();
      const target = reachable[0];
      
      game.selectSystem(target.id);
      const distance = game.getDistanceToSelected()!;
      
      game.jump(target.id);
      
      expect(game.getPlayer().ship.fuel).toBeCloseTo(initialFuel - distance, 1);
    });

    it('fails when no route exists', () => {
      const game = createGame();
      const result = game.jump('nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('route');
    });

    it('fails when not enough fuel', () => {
      const game = createGame();
      // Drain fuel first
      const reachable = game.getReachableSystems();
      game.jump(reachable[0].id);
      game.jump(STARTING_LOCATION); // Jump back
      
      // Try to jump to furthest system with low fuel
      const player = game.getPlayer();
      // Find a system we can't reach
      const galaxy = game.getGalaxy();
      const farSystem = galaxy.systems.find(s => {
        const dist = game.getState().galaxy.routes.find(
          r => (r.from === player.location && r.to === s.id) || 
               (r.to === player.location && r.from === s.id)
        )?.distance;
        return dist && dist > player.ship.fuel;
      });
      
      if (farSystem) {
        const result = game.jump(farSystem.id);
        expect(result.success).toBe(false);
        expect(result.error).toContain('fuel');
      }
    });

    it('returns to station view after jump', () => {
      const game = createGame();
      game.setView('galaxy');
      const reachable = game.getReachableSystems();
      
      game.jump(reachable[0].id);
      
      expect(game.getState().view).toBe('station');
    });
  });

  describe('refuel', () => {
    it('increases fuel', () => {
      const game = createGame();
      // First drain some fuel
      const reachable = game.getReachableSystems();
      game.jump(reachable[0].id);
      const fuelAfterJump = game.getPlayer().ship.fuel;
      
      game.refuel(2);
      
      expect(game.getPlayer().ship.fuel).toBeGreaterThan(fuelAfterJump);
    });

    it('costs credits', () => {
      const game = createGame();
      const reachable = game.getReachableSystems();
      game.jump(reachable[0].id);
      const creditsBeforeRefuel = game.getPlayer().credits;
      
      const result = game.refuel(2);
      
      expect(result.success).toBe(true);
      expect(game.getPlayer().credits).toBeLessThan(creditsBeforeRefuel);
    });

    it('returns cost of refuel', () => {
      const game = createGame();
      const reachable = game.getReachableSystems();
      game.jump(reachable[0].id);
      
      const result = game.refuel(2);
      
      expect(result.cost).toBeGreaterThan(0);
    });
  });

  describe('system selection', () => {
    it('selects system', () => {
      const game = createGame();
      game.selectSystem('diso');
      
      expect(game.getState().selectedSystem).toBe('diso');
    });

    it('clears selection', () => {
      const game = createGame();
      game.selectSystem('diso');
      game.selectSystem(null);
      
      expect(game.getState().selectedSystem).toBeNull();
    });

    it('gets selected system', () => {
      const game = createGame();
      game.selectSystem('diso');
      
      const selected = game.getSelectedSystem();
      expect(selected?.id).toBe('diso');
    });

    it('gets distance to selected', () => {
      const game = createGame();
      game.selectSystem('leesti');
      
      const distance = game.getDistanceToSelected();
      expect(distance).toBe(3.1);
    });

    it('checks if can jump to selected', () => {
      const game = createGame();
      game.selectSystem('leesti');
      
      expect(game.canJumpToSelected()).toBe(true);
    });
  });

  describe('view management', () => {
    it('sets view', () => {
      const game = createGame();
      game.setView('galaxy');
      
      expect(game.getState().view).toBe('galaxy');
    });
  });
});
