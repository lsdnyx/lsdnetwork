# Pixel World

A lightweight 2D pixel-art platformer with a solo preview and a five-player room server.

## Project files

- index.html: complete frontend, styling, canvas renderer and controls
- worker.js: Cloudflare Worker and Durable Object WebSocket room server
- wrangler.toml: Durable Object binding and migration

## Run the solo game

Open index.html in a modern browser. No build tools or packages are required.

## Deploy the multiplayer server

1. Install Node.js and Wrangler on your computer.
2. Open a terminal in this folder.
3. Run: npm install -g wrangler
4. Run: wrangler login
5. Run: wrangler deploy

The first deployment creates the Durable Object class using the migration in wrangler.toml.

After deployment, copy the HTTPS workers.dev URL. In index.html, find GAME_SERVER_URL and replace the empty string with that URL. Commit and deploy the updated frontend.

The frontend converts the HTTPS Worker URL to WSS for room connections. The Worker health check is available at /health.

## Controls

- A / D or Left / Right: move
- Space, W or Up: jump

## Notes

This is an early prototype. The server simulates player movement and broadcasts room state at 20 updates per second. Rooms are identified by short codes and hold up to five simultaneous players.
