import {GameRoom} from "./rooms.js";
export {GameRoom};

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==="/health")return Response.json({ok:true,service:"diwali-town-public-world"});
    if(url.pathname!=="/world")return new Response("Not found",{status:404});
    if(request.headers.get("Upgrade")!=="websocket")return new Response("WebSocket required",{status:426});
    // Every visitor is routed to this one permanent public world.
    const id=env.GAME_ROOMS.idFromName("DIWALI-TOWN-PUBLIC-WORLD");
    return env.GAME_ROOMS.get(id).fetch(request);
  }
};