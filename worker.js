const MAX_PLAYERS = 5;
const WORLD_WIDTH = 4200;
const GROUND_Y = 478;
const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 42;
const PLATFORMS = [
  { x: 360, y: 390, w: 170 }, { x: 690, y: 330, w: 160 },
  { x: 1010, y: 405, w: 190 }, { x: 1390, y: 350, w: 170 },
  { x: 1740, y: 290, w: 180 }, { x: 2110, y: 390, w: 210 },
  { x: 2510, y: 335, w: 180 }, { x: 2860, y: 400, w: 190 },
  { x: 3260, y: 315, w: 190 }, { x: 3650, y: 380, w: 210 }
];
const COLORS = ["#ef7168", "#62b8ee", "#f2c65c", "#aa91ef", "#68ce9a"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "pixel-world-worker" });
    }
    const match = url.pathname.match(/^\/room\/([A-Z0-9]{4,8})$/i);
    if (!match) return new Response("Not found", { status: 404 });
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("WebSocket upgrade required", { status: 426 });
    }
    const roomCode = match[1].toUpperCase();
    const id = env.GAME_ROOMS.idFromName(roomCode);
    return env.GAME_ROOMS.get(id).fetch(request);
  }
};

export class GameRoom {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const sockets = this.state.getWebSockets();
    if (sockets.length >= MAX_PLAYERS) {
      return new Response("Room is full (5 players maximum).", { status: 409 });
    }

    const url = new URL(request.url);
    const rawName = url.searchParams.get("name") || "Player";
    const name = rawName.replace(/[^a-zA-Z0-9 _-]/g, "").trim().slice(0, 16) || "Player";
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const playerId = crypto.randomUUID();
    const player = {
      id: playerId,
      name,
      color: COLORS[sockets.length % COLORS.length],
      x: 90 + sockets.length * 48,
      y: GROUND_Y - PLAYER_HEIGHT,
      vx: 0,
      vy: 0,
      onGround: true,
      input: { left: false, right: false, jump: false },
      previousJump: false
    };

    server.serializeAttachment(player);
    this.state.acceptWebSocket(server);
    server.send(JSON.stringify({ type: "welcome", playerId }));
    this.broadcast();
    await this.startSimulation();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > 1024) return;
    let data;
    try { data = JSON.parse(message); } catch { return; }
    if (data.type !== "input") return;

    const player = ws.deserializeAttachment();
    if (!player) return;
    player.input = {
      left: data.left === true,
      right: data.right === true,
      jump: data.jump === true
    };
    ws.serializeAttachment(player);
  }

  async webSocketClose() {
    this.broadcast();
  }

  async webSocketError() {
    this.broadcast();
  }

  async startSimulation() {
    if (await this.state.storage.getAlarm() === null) {
      await this.state.storage.setAlarm(Date.now() + 50);
    }
  }

  async alarm() {
    const sockets = this.state.getWebSockets();
    if (sockets.length === 0) return;

    for (const ws of sockets) {
      const p = ws.deserializeAttachment();
      if (!p) continue;
      const input = p.input || {};
      const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      p.vx = direction * 220;

      const oldBottom = p.y + PLAYER_HEIGHT;
      p.x = Math.max(0, Math.min(WORLD_WIDTH - PLAYER_WIDTH, p.x + p.vx * 0.05));

      if (input.jump && !p.previousJump && p.onGround) {
        p.vy = -390;
        p.onGround = false;
      }
      p.previousJump = !!input.jump;

      p.vy = Math.min(700, p.vy + 1000 * 0.05);
      p.y += p.vy * 0.05;
      p.onGround = false;

      if (p.y + PLAYER_HEIGHT >= GROUND_Y) {
        p.y = GROUND_Y - PLAYER_HEIGHT;
        p.vy = 0;
        p.onGround = true;
      }

      for (const platform of PLATFORMS) {
        if (p.vy >= 0 && oldBottom <= platform.y &&
            p.y + PLAYER_HEIGHT >= platform.y &&
            p.x + PLAYER_WIDTH > platform.x && p.x < platform.x + platform.w) {
          p.y = platform.y - PLAYER_HEIGHT;
          p.vy = 0;
          p.onGround = true;
        }
      }
      ws.serializeAttachment(p);
    }

    this.broadcast();
    await this.state.storage.setAlarm(Date.now() + 50);
  }

  broadcast() {
    const sockets = this.state.getWebSockets();
    const players = sockets.map(ws => ws.deserializeAttachment()).filter(Boolean);
    const payload = JSON.stringify({ type: "state", players });
    for (const ws of sockets) {
      try { ws.send(payload); } catch { /* Closed sockets are removed by the runtime. */ }
    }
  }
}