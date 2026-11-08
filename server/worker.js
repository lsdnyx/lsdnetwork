import {GameRoom} from "./rooms.js";
export {GameRoom};

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==="/health")return Response.json({ok:true,service:"diwali-town"});
    const match=url.pathname.match(/^\/room\/([A-Z0-9]{4,8})$/i);
    if(!match)return new Response("Not found",{status:404});
    if(request.headers.get("Upgrade")!=="websocket")return new Response("WebSocket required",{status:426});
    const id=env.GAME_ROOMS.idFromName(match[1].toUpperCase());
    return env.GAME_ROOMS.get(id).fetch(request);
  }
};
