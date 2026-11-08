const MAX_PLAYERS=5,WIDTH=2400,HEIGHT=1680,SPEED=190,W=26,H=34;
const COLORS=["#f18b64","#72bde4","#e9c56c","#ad98e8","#7bc99c"];
const BLOCKERS=[
  {x:352,y:225,w:196,h:122},{x:852,y:225,w:196,h:122},{x:1422,y:360,w:166,h:92},{x:992,y:1020,w:276,h:158},
  {x:620,y:638,w:105,h:62},{x:830,y:638,w:105,h:62},{x:1290,y:668,w:105,h:62},
  {x:190,y:700,w:120,h:70},{x:1930,y:280,w:180,h:150},{x:1830,y:1050,w:150,h:120},{x:480,y:1160,w:160,h:120},{x:1510,y:1250,w:130,h:100}
];
function blocked(x,y){if(x<0||y<0||x+W>WIDTH||y+H>HEIGHT)return true;return BLOCKERS.some(o=>x<o.x+o.w&&x+W>o.x&&y<o.y+o.h&&y+H>o.y)}
export class GameRoom{
  constructor(state){this.state=state}
  async fetch(request){
    const sockets=this.state.getWebSockets();if(sockets.length>=MAX_PLAYERS)return new Response("Room is full (5 players maximum).",{status:409});
    const url=new URL(request.url),raw=url.searchParams.get("name")||"Guest",name=raw.replace(/[^a-zA-Z0-9 _-]/g,"").trim().slice(0,16)||"Guest";
    const pair=new WebSocketPair(),client=pair[0],server=pair[1],id=crypto.randomUUID();
    const p={id,name,color:COLORS[sockets.length%COLORS.length],x:1160+sockets.length*38,y:640,vx:0,vy:0,input:{x:0,y:0}};
    server.serializeAttachment(p);this.state.acceptWebSocket(server);server.send(JSON.stringify({type:"welcome",playerId:id}));
    this.broadcast();if(await this.state.storage.getAlarm()===null)await this.state.storage.setAlarm(Date.now()+50);
    return new Response(null,{status:101,webSocket:client});
  }
  async webSocketMessage(ws,message){
    if(typeof message!=="string"||message.length>512)return;let data;try{data=JSON.parse(message)}catch{return}
    if(data.type!=="input")return;const p=ws.deserializeAttachment();if(!p)return;
    const x=Math.max(-1,Math.min(1,(data.right?1:0)-(data.left?1:0))),y=Math.max(-1,Math.min(1,(data.down?1:0)-(data.up?1:0)));
    const length=Math.hypot(x,y)||1;p.input={x:x/length,y:y/length};ws.serializeAttachment(p);
  }
  async webSocketClose(){this.broadcast()}
  async webSocketError(){this.broadcast()}
  async alarm(){
    const sockets=this.state.getWebSockets();if(!sockets.length)return;
    for(const ws of sockets){
      const p=ws.deserializeAttachment();if(!p)continue;
      const dx=p.input.x*SPEED*.05,dy=p.input.y*SPEED*.05;
      if(!blocked(p.x+dx,p.y))p.x+=dx;if(!blocked(p.x,p.y+dy))p.y+=dy;
      p.x=Math.max(0,Math.min(WIDTH-W,p.x));p.y=Math.max(0,Math.min(HEIGHT-H,p.y));ws.serializeAttachment(p);
    }
    this.broadcast();await this.state.storage.setAlarm(Date.now()+50);
  }
  broadcast(){
    const sockets=this.state.getWebSockets(),players=sockets.map(ws=>ws.deserializeAttachment()).filter(Boolean);
    const message=JSON.stringify({type:"state",players});for(const ws of sockets){try{ws.send(message)}catch{}}
  }
}
