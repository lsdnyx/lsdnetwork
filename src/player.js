import {PLAYER,COLORS} from "./config.js";
export class Player {
  constructor({id="local",name="Guest",x=1180,y=640,color=COLORS[0],local=true}={}){
    this.id=id;this.name=name;this.x=x;this.y=y;this.w=PLAYER.width;this.h=PLAYER.height;this.color=color;this.local=local;this.facing=1;this.walkTime=0;
  }
  update(dt,move,world){
    const dx=move.x*PLAYER.speed*dt,dy=move.y*PLAYER.speed*dt;
    if(Math.abs(dx)+Math.abs(dy)>.1){this.facing=dx<0?-1:dx>0?1:this.facing;this.walkTime+=dt*12}
    world.move(this,dx,dy);
  }
  draw(ctx,camera){
    const x=Math.round(this.x-camera.x),y=Math.round(this.y-camera.y),step=Math.sin(this.walkTime)*2;
    ctx.fillStyle="#15251e66";ctx.beginPath();ctx.ellipse(x+13,y+34,13,4,0,0,Math.PI*2);ctx.fill();
    ctx.save();if(this.facing<0){ctx.translate(x+26,0);ctx.scale(-1,1)}else ctx.translate(x,0);
    ctx.fillStyle="#45312c";ctx.fillRect(6,y+23+step,6,11);ctx.fillRect(16,y+23-step,6,11);
    ctx.fillStyle="#f1d4a5";ctx.fillRect(4,y+8,19,19);
    ctx.fillStyle=this.color;ctx.fillRect(3,y+13,21,15);ctx.fillRect(6,y+10,15,5);
    ctx.fillStyle="#c88d69";ctx.fillRect(7,y,14,14);ctx.fillStyle="#30282a";ctx.fillRect(5,y-2,18,6);ctx.fillRect(7,y+3,3,3);ctx.fillRect(17,y+3,3,3);
    ctx.fillStyle="#fff0cf";ctx.fillRect(9,y+5,2,2);ctx.fillRect(18,y+5,2,2);
    ctx.fillStyle="#f4d4a4";ctx.fillRect(0,y+15,4,11);ctx.fillRect(24,y+15,4,11);
    ctx.restore();
    ctx.fillStyle=this.local?"#fff0cf":"#e4eaf0";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(this.name.slice(0,13),x+13,y-9);
    if(this.local){ctx.fillStyle="#f2ca73";ctx.fillRect(x+11,y-16,4,4)}
  }
}
