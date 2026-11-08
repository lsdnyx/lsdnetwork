# Diwali Town

A lightweight, top-down 2D browser game set in a colourful Indian Diwali town. Built with vanilla JavaScript and Canvas for desktop and mobile browsers.

## Current prototype

- Top-down walking with keyboard and on-screen mobile joystick
- Responsive desktop and mobile layout
- Diwali market, sweet shop, decoration shop, chai stall, NPCs, rangoli, diyas and lanterns
- Interactions, shop purchases, wallet, inventory and a small quest
- One shared public multiplayer world using a Cloudflare Worker and Durable Objects
- Automatic public-world connection; no room codes or private rooms
- Local wallet, name and inventory saved in each browser

## Run locally

Serve the folder with any static web server. From the project root:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Opening index.html directly as a file may block JavaScript modules.

## Deploy frontend

Deploy the repository root as a static site on Cloudflare Pages. No build command is required. The output directory is the repository root.

## Deploy the public multiplayer server

1. Install Node.js.
2. From the repository root, run `npm install -g wrangler`.
3. Run `wrangler login` and approve Cloudflare access.
4. Run `wrangler deploy`.
5. Copy the Worker HTTPS URL.
6. Set `serverUrl` in `src/network.js` to that URL, then commit the change to main so Pages redeploys.

The Worker health check is at `/health`. All players connect to `/world`, which is routed to one permanent shared Durable Object. The prototype currently allows up to 50 simultaneous players.

## Controls

Desktop: WASD / arrow keys to move, E / Enter / Space to interact, I / B to open inventory.

Mobile: drag the on-screen joystick to move; use the E button to interact and the bag button to open inventory.

## Notes

This is an early playable prototype, not a finished commercial game. The shared world synchronizes player positions. Wallets, inventory, purchases and quest progress are still local to each browser and are not yet shared between players. Audio, cloud accounts, shared purchases, advanced quests, NPC pathfinding and richer character animation are future work.
