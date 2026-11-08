# Diwali Town

A lightweight, top-down 2D browser game set in a colourful Indian Diwali town. Built with vanilla JavaScript and Canvas so it can run on desktop and mobile browsers without a game engine download.

## Current prototype

- Top-down walking with keyboard and on-screen mobile joystick
- Responsive desktop and mobile layout
- Diwali market, sweet shop, decoration shop, chai stall, NPCs, rangoli, diyas and lanterns
- Interactions, shop purchases, wallet, inventory and a small quest
- Cloudflare Worker + Durable Objects multiplayer room server scaffold (up to five players)
- Local wallet, name and inventory saved in the browser

## Run locally

Because the game uses JavaScript modules, serve the folder with any static web server. For example, from the project root:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

Opening index.html directly as a file may block module loading in some browsers.

## Deploy frontend

Deploy the repository root as a static site on Cloudflare Pages. No build command is required. The output directory is the repository root.

## Deploy multiplayer

1. Install Node.js, then install Wrangler: `npm install -g wrangler`
2. Run `wrangler login`
3. From the repository root, run `wrangler deploy`
4. Copy the deployed Worker HTTPS URL.
5. Open `src/network.js` and set `serverUrl` to that URL.
6. Commit and redeploy the frontend.

The Worker exposes a health check at `/health` and WebSocket rooms at `/room/ROOMCODE`. Each room supports up to five players.

## Controls

Desktop: WASD / arrow keys to move, E / Enter / Space to interact, I / B to open inventory.

Mobile: drag the on-screen joystick to move; use the E button to interact and the bag button to open inventory.

## Notes

This is an early playable prototype, not a finished commercial game. The town, shops and local inventory are implemented. Multiplayer is a server scaffold and needs a real multi-device test after deployment. Audio, persistent cloud accounts, shared purchases, advanced quests, NPC pathfinding and richer character animation are planned for later milestones.
