import {WORLD,BUILDINGS,STALLS,NPCS,OBSTACLES} from "./config.js";

function seeded(n){const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)}
export class World {
  constructor(){this.decorations=[];for(let i=0;i<160;i++){this.decorations.push({x:seeded(i+1)*WORLD.width,y:seeded(i+501)*WORLD.height,type:i%4})}}
  isBlocked(x,y,w,h){
    if(x<0||y<0||x+w>WORLD.width||y+h>WORLD.height)return true;
    return OBSTACLES.some(o=>x<o.x+o.w&&x+w>o.x&&y<o.y+o.h&&y+h>o.y);
  }
  move(player,dx,dy){
    const nx=player.x+dx,ny=player.y+dy;
    if(!this.isBlocked(nx,player.y,player.w,player.h))player.x=nx;
    if(!this.isBlocked(player.x,ny,player.w,player.h))player.y=ny;
    player.x=Math.max(0,Math.min(WORLD.width-player.w,player.x));
    player.y=Math.max(0,Math.min(WORLD.height-player.h,player.y));
  }
  draw(ctx,camera,time){
    ctx.fillStyle="#294b3b";ctx.fillRect(0,0,WORLD.width,WORLD.height);
    // soft grass pattern
    for(let i=0;i<this.decorations.length;i++){const d=this.decorations[i];ctx.fillStyle=d.type===0?"#315642":d.type===1?"#345a45":d.type===2?"#2d513f":"#385d47";ctx.fillRect(d.x,d.y,12,7)}
    // streets and paving
    ctx.fillStyle="#9b7957";ctx.fillRect(0,760,WORLD.width,150);ctx.fillRect(1110,0,150,WORLD.height);ctx.fillRect(300,450,1450,110);
    ctx.fillStyle="#b18b65";ctx.fillRect(0,772,WORLD.width,8);ctx.fillRect(0,890,WORLD.width,8);ctx.fillRect(1122,0,8,WORLD.height);ctx.fillRect(1240,0,8,WORLD.height);
    for(let x=20;x<WORLD.width;x+=90){ctx.fillStyle="#c8a47c";ctx.fillRect(x,824,38,3)}
    // garden patches
    this.drawGarden(ctx,110,160,160,170);this.drawGarden(ctx,1810,650,230,180);this.drawGarden(ctx,280,1250,190,180);
    this.drawRangoli(ctx,1100,835,52);this.drawRangoli(ctx,1770,850,35);this.drawRangoli(ctx,1310,1260,43);
    this.drawDiyas(ctx,time);
    this.drawLanterns(ctx,time);
    STALLS.forEach(s=>this.drawStall(ctx,s,time));
    BUILDINGS.forEach(b=>this.drawBuilding(ctx,b));
    NPCS.forEach(n=>this.drawNpc(ctx,n,time));
    this.drawTownBoard(ctx);
  }
  drawGarden(ctx,x,y,w,h){
    ctx.fillStyle="#254734";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#557c54";ctx.lineWidth=5;ctx.strokeRect(x+2,y+2,w-4,h-4);
    for(let i=0;i<10;i++){const px=x+15+(i*37)%Math.max(30,w-25),py=y+20+(i*53)%Math.max(30,h-35);ctx.fillStyle=i%2?"#e7a4a0":"#e9c66d";ctx.fillRect(px,py,7,7);ctx.fillStyle="#47764d";ctx.fillRect(px+2,py+7,3,8)}
  }
  drawRangoli(ctx,x,y,r){
    ctx.save();ctx.translate(x,y);const colors=["#f2c46c","#e98987","#83b8ce","#a98dd1","#f5e2ad"];
    for(let ring=0;ring<3;ring++){ctx.beginPath();ctx.arc(0,0,r-ring*10,0,Math.PI*2);ctx.strokeStyle=colors[ring];ctx.lineWidth=3;ctx.stroke()}
    for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.fillStyle=colors[i%colors.length];ctx.beginPath();ctx.ellipse(0,-r+10,5,12,0,0,Math.PI*2);ctx.fill();ctx.restore()}
    ctx.fillStyle="#ffe3a0";ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  drawDiyas(ctx,time){
    const points=[[330,690],[520,690],[760,690],[970,690],[1360,690],[1610,690],[1830,930],[720,1050],[970,1110],[1440,1110],[1700,1190],[500,950],[2020,520]];
    points.forEach(([x,y],i)=>{const glow=.45+.2*Math.sin(time/240+i);ctx.fillStyle="rgba(255,190,91,"+(glow*.17)+")";ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d68c4c";ctx.beginPath();ctx.ellipse(x,y,7,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ffe39b";ctx.fillRect(x-1,y-9,2,7)});
  }
  drawLanterns(ctx,time){
    for(let i=0;i<9;i++){const x=170+i*245,y=115+(i%3)*33;const pulse=Math.sin(time/400+i)*2;ctx.strokeStyle="#b99a69";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-40);ctx.lineTo(x,y+3);ctx.stroke();ctx.fillStyle=i%2?"#d77d65":"#e7b85f";ctx.fillRect(x-9,y-1+pulse,18,25);ctx.fillStyle="#ffe4a1";ctx.fillRect(x-4,y+5+pulse,8,13);ctx.fillStyle="#f2c86d";ctx.fillRect(x-6,y+24+pulse,12,3)}
  }
  drawBuilding(ctx,b){
    const {x,y,w,h}=b;ctx.fillStyle="#1b3029";ctx.fillRect(x+8,y+13,w,h);ctx.fillStyle=b.color;ctx.fillRect(x,y+18,w,h-18);ctx.fillStyle=b.roof;ctx.fillRect(x-9,y,w+18,31);
    ctx.fillStyle="#f4d48d";ctx.fillRect(x+12,y+33,w-24,6);ctx.fillStyle="#3b2930";ctx.fillRect(x+w/2-15,y+h-55,30,55);
    ctx.fillStyle="#f5d48a";ctx.fillRect(x+22,y+55,28,34);ctx.fillRect(x+w-50,y+55,28,34);ctx.fillStyle="#5b3a35";ctx.fillRect(x+33,y+55,5,34);ctx.fillRect(x+w-39,y+55,5,34);
    ctx.fillStyle="#fff0c7";ctx.font="bold 12px monospace";ctx.textAlign="center";ctx.fillText(b.sign,x+w/2,y+16);
    ctx.fillStyle="#f2c46c";ctx.fillRect(x+8,y+h-7,w-16,5);
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?"#e7a65c":"#f5d48a";ctx.fillRect(x+12+i*34,y+h-17,5,5)}
  }
  drawStall(ctx,s,time){
    const {x,y,w,h}=s;ctx.fillStyle="#1d3029";ctx.fillRect(x+4,y+14,w,h);ctx.fillStyle="#8c5742";ctx.fillRect(x,y+15,w,h-15);
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?"#e8b96b":"#b94f51";ctx.fillRect(x+i*w/5,y,w/5+1,20)}
    ctx.fillStyle="#f8d88e";ctx.fillRect(x+5,y+22,w-10,5);ctx.font="21px serif";ctx.textAlign="center";ctx.fillText(s.emoji,x+w/2,y+53+Math.sin(time/400)*1.5);
    ctx.fillStyle="#f3d8a4";ctx.fillRect(x+8,y+h-10,w-16,5);
  }
  drawNpc(ctx,n,time){
    ctx.fillStyle="#1b302b";ctx.fillRect(n.x-2,n.y+24,26,6);ctx.fillStyle=n.color;ctx.fillRect(n.x+3,n.y+7,18,22);ctx.fillStyle="#dba982";ctx.fillRect(n.x+5,n.y-5,15,15);ctx.fillStyle="#342b2c";ctx.fillRect(n.x+4,n.y-7,17,6);ctx.fillStyle="#f9e2b8";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(n.name,n.x+12,n.y-13);
    if(Math.sin(time/280+n.x)>.7){ctx.fillStyle="#ffe6a1";ctx.fillRect(n.x+22,n.y-17,4,4)}
  }
  drawTownBoard(ctx){
    ctx.fillStyle="#694a34";ctx.fillRect(1850,1120,10,100);ctx.fillStyle="#b98a55";ctx.fillRect(1810,1090,90,55);ctx.fillStyle="#fff0c8";ctx.font="bold 10px monospace";ctx.textAlign="center";ctx.fillText("WISH WALL",1855,1112);ctx.fillStyle="#e9c16f";ctx.fillRect(1822,1120,9,9);ctx.fillStyle="#d98981";ctx.fillRect(1840,1120,9,9);ctx.fillStyle="#89b8cb";ctx.fillRect(1858,1120,9,9);ctx.fillStyle="#a991d1";ctx.fillRect(1876,1120,9,9);
  }
}
