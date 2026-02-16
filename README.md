# Frontier

An Elite-style space trading game built with Next.js and TypeScript.

Travel between star systems, trade commodities, and build your fortune. Buy low in agricultural systems, sell high in high-tech ones. Manage your fuel carefully - getting stranded in deep space is embarrassing and fatal.

Features retro sound effects (synthesized via Web Audio API) for that authentic 80s space trader vibe. Local leaderboard tracks the galaxy's wealthiest traders.

## Play

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## How to Play

1. Start at Lave Station with 100 credits and a full tank
2. Check the market - prices vary by system type
3. Buy cargo (food is cheap in agricultural systems)
4. Launch and open the galaxy map
5. Jump to another system (fuel permitting)
6. Sell your cargo for profit
7. Repeat until rich (or stranded)

## Trading Tips

- Agricultural systems: cheap food
- Industrial systems: cheap minerals  
- Mining systems: cheap minerals
- High-tech systems: cheap computers, expensive everything else

The profit is in the arbitrage. Know your markets.

## Controls

**Station View:**
- Buy/Sell commodities in the market
- Refuel before long journeys
- Launch to access galaxy map

**Galaxy Map:**
- Click systems to select them
- Green ring = in fuel range
- Red text = out of range
- Jump button travels to selected system

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Canvas 2D for galaxy map
- Tailwind CSS
- Jest for testing

## Architecture

```
src/
├── app/           # Next.js pages
├── components/    # React UI
│   ├── GameCanvas.tsx     # Main orchestrator
│   ├── StationView.tsx    # Trading interface
│   ├── GalaxyMap.tsx      # Navigation
│   ├── MarketPanel.tsx    # Buy/sell
│   ├── CargoPanel.tsx     # Cargo hold
│   └── StatusBar.tsx      # Credits/fuel/cargo
└── game/          # Pure TypeScript logic
    ├── Galaxy.ts          # System/route management
    ├── Market.ts          # Price calculation
    ├── Ship.ts            # Fuel/cargo
    ├── Player.ts          # State management
    ├── Trade.ts           # Buy/sell logic
    ├── Game.ts            # Orchestrator
    └── Renderer.ts        # Canvas drawing
```

All game logic is testable without React.

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Run linter
```

## License

MIT

## Author

Katie
