import {Input} from "./input.js";
import {World} from "./world.js";
import {Player} from "./player.js";
import {Network} from "./network.js";
import {UI} from "./ui.js";
import {NPCS,BUILDINGS,STALLS,WORLD} from "./config.js";

class DiwaliGame{
  constructor(){
    this.canvas=document.getElementById("world");this.ctx=this.canvas.getContext("2d");this.world=new World();this.input=new Input(this.canvas);
    this.player=new Player({name:localStorage.getItem("diwali-name")||"Guest"});this.camera={x:0,y:0};this.network=new Network(this);this.ui=new UI(this);
    this.coins=Number(localStorage.getItem("diwali-coins")||100);this.inventory=JSON.parse(localStorage.getItem("diwali-inventory")||"{}");this.quest=JSON.parse(localStorage.getItem("diwali-quest")||'{"shop":false,"talk":false}');
    this.otherPlayers=new Map();this.nearby=null;this.soundOn=false;this.last=0;this.time=0;
    this.ui.refresh();this.resize();addEventListener("resize",()=>this.resize());requestAnimationFrame(t=>this.frame(t));
    setTimeout(()=>document.getElementById("loading-cover").classList.add("done"),550);
    this.ui.toast("Welcome! Wander over to the market and say hello.");
  }
  resize(){
    const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
    if(!r.width||!r.height)return;
    this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);
    this.ctx.setTransform(this.canvas.width/960,0,0,this.canvas.height/600,0,0);
  }
  save(){localStorage.setItem("diwali-name",this.player.name);localStorage.setItem("diwali-coins",String(this.coins));localStorage.setItem("diwali-inventory",JSON.stringify(this.inventory));localStorage.setItem("diwali-quest",JSON.stringify(this.quest))}
  createRoom(){const code=Math.random().toString(36).slice(2,8).toUpperCase();this.network.connect(code);this.ui.showRoomCode(code)}
  joinRoom(code){const clean=String(code||"").trim().toUpperCase();if(!/^[A-Z0-9]{4,8}$/.test(clean)){this.ui.toast("Enter a room code with 4–8 letters or numbers.");return}this.network.connect(clean)}
  applyNetworkState(players){
    for(const p of players){if(p.id===this.network.playerId){this.player.x=p.x;this.player.y=p.y;continue}
      let other=this.otherPlayers.get(p.id);if(!other){other=new Player({id:p.id,name:p.name,x:p.x,y:p.y,color:p.color,local:false});this.otherPlayers.set(p.id,other)}
      other.name=p.name;other.targetX=p.x;other.targetY=p.y;other.color=p.color;
    }
    const ids=new Set(players.map(p=>p.id));for(const id of this.otherPlayers.keys())if(!ids.has(id))this.otherPlayers.delete(id);
  }
  nearbyObject(){
    const cx=this.player.x+this.player.w/2,cy=this.player.y+this.player.h/2,items=[
      ...BUILDINGS.map(b=>({...b,ix:b.x+b.w/2,iy:b.y+b.h+14})),
      ...STALLS.map(s=>({...s,ix:s.x+s.w/2,iy:s.y+s.h+12})),
      ...NPCS.map(n=>({...n,type:"npc",ix:n.x+12,iy:n.y+20})),
      {id:"town-hall",name:"Festival Courtyard",type:"hall",ix:1130,iy:1200}
    ];
    let nearest=null,dist=66;for(const item of items){const d=Math.hypot(cx-item.ix,cy-item.iy);if(d<dist){dist=d;nearest=item}}
    return nearest;
  }
  interact(){if(this.nearby)this.ui.interact(this.nearby);else this.ui.toast("Nothing nearby to interact with. Explore the town!")}
  toggleSound(){this.soundOn=!this.soundOn;this.ui.toast(this.soundOn?"Sound toggle is on. Ambient audio will be added in a later update.":"Sound muted.")}
  frame(t){
    const dt=Math.min((t-this.last)/1000||0,.04);this.last=t;this.time=t;
    const move=this.input.getMovement();
    if(!this.network.connected)this.player.update(dt,move,this.world);
    else this.network.sendInput(move,t);
    for(const other of this.otherPlayers.values()){if(other.targetX!==undefined){other.x+=(other.targetX-other.x)*Math.min(1,dt*12);other.y+=(other.targetY-other.y)*Math.min(1,dt*12)}}
    this.camera.x=Math.max(0,Math.min(WORLD.width-960,this.player.x+this.player.w/2-480));
    this.camera.y=Math.max(0,Math.min(WORLD.height-600,this.player.y+this.player.h/2-300));
    this.nearby=this.nearbyObject();const hint=document.getElementById("interaction-hint");
    if(this.nearby){hint.textContent="E  ·  "+this.nearby.name;hint.classList.add("visible")}else hint.classList.remove("visible");
    if(this.input.consumeInteract())this.interact();if(this.input.consumeBag())this.ui.openBag();
    this.render();document.getElementById("clock").textContent="8:"+(String(Math.floor(t/15000)%60).padStart(2,"0"))+" PM";
    requestAnimationFrame(next=>this.frame(next));
  }
  render(){
    const ctx=this.ctx;ctx.clearRect(0,0,960,600);ctx.save();ctx.translate(-this.camera.x,-this.camera.y);
    this.world.draw(ctx,this.camera,this.time);
    for(const other of this.otherPlayers.values())other.draw(ctx);
    this.player.draw(ctx);
    for(let i=0;i<15;i++){const x=(i*167+this.time*.012)%WORLD.width,y=90+(i*113)%1400;ctx.fillStyle="rgba(255,221,150,"+(.15+.15*Math.sin(this.time/450+i))+")";ctx.fillRect(x,y,2,2)}
    ctx.restore();
  }
}
window.addEventListener("DOMContentLoaded",()=>{window.diwaliGame=new DiwaliGame()});