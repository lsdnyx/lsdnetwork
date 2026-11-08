import {ITEMS} from "./config.js";
export class UI {
  constructor(game){
    this.game=game;this.backdrop=document.getElementById("modal-backdrop");this.title=document.getElementById("modal-title");this.kicker=document.getElementById("modal-kicker");this.content=document.getElementById("modal-content");this.actions=document.getElementById("modal-actions");this.toastEl=document.getElementById("toast");this.toastTimer=0;
    document.getElementById("modal-close").addEventListener("click",()=>this.close());
    this.backdrop.addEventListener("pointerdown",e=>{if(e.target===this.backdrop)this.close()});
    document.getElementById("open-bag").addEventListener("click",()=>this.openBag());
    document.getElementById("change-name").addEventListener("click",()=>this.changeName());
    document.getElementById("help-button").addEventListener("click",()=>this.help());
    document.getElementById("create-room").addEventListener("click",()=>this.game.createRoom());
    document.getElementById("join-room").addEventListener("click",()=>this.game.joinRoom(document.getElementById("room-code").value));
    document.getElementById("sound-toggle").addEventListener("click",()=>this.game.toggleSound());
    document.addEventListener("keydown",e=>{if(e.key==="Escape")this.close()});
  }
  show(title,content,actions=[],kicker="DIWALI TOWN"){
    this.title.textContent=title;this.kicker.textContent=kicker;this.content.innerHTML=content;this.actions.replaceChildren();
    actions.forEach(a=>{const b=document.createElement("button");b.className="button "+(a.primary?"button-primary":"button-outline");b.textContent=a.label;b.addEventListener("click",()=>a.action());this.actions.append(b)});
    this.backdrop.hidden=false;
  }
  close(){this.backdrop.hidden=true}
  toast(message){
    this.toastEl.textContent=message;this.toastEl.classList.add("show");clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.toastEl.classList.remove("show"),2200);
  }
  refresh(){
    const g=this.game,p=g.player;document.getElementById("coin-count").textContent=g.coins;document.getElementById("player-name-label").textContent=p.name;document.getElementById("avatar").textContent=p.name.slice(0,1).toUpperCase();
    document.getElementById("room-label").textContent=g.network.connected?"Room "+g.network.roomCode:"Exploring alone";
    document.getElementById("player-count").textContent=(g.network.players.length||1)+" / 5";
    document.getElementById("connection-label").textContent=g.network.connected?"ROOM "+g.network.roomCode:"SOLO WORLD";
    document.getElementById("connection-label").parentElement.style.color=g.network.connected?"#a7e0b4":"#e6c98d";
    const items=Object.entries(g.inventory).filter(([,qty])=>qty>0);
    const preview=document.getElementById("inventory-preview");preview.replaceChildren();
    for(let i=0;i<4;i++){const entry=items[i],slot=document.createElement("div");slot.className="inventory-slot"+(entry?"":" empty");slot.innerHTML=entry?'<span class="item-emoji">'+ITEMS[entry[0]].emoji+'</span><small>×'+entry[1]+'</small>':'<span class="item-emoji">·</span><small>EMPTY</small>';preview.append(slot)}
    const done=(g.quest.shop?1:0)+(g.quest.talk?1:0);document.getElementById("quest-progress").style.width=(done/2*100)+"%";document.getElementById("quest-progress-label").textContent=done+" / 2 completed";
    const list=document.getElementById("friend-list");list.replaceChildren();
    const all=[{name:p.name,local:true},...g.network.players.filter(x=>x.id!==g.network.playerId).map(x=>({name:x.name,local:false}))];
    all.slice(0,5).forEach(x=>{const row=document.createElement("div");row.className="friend-row";row.innerHTML='<span class="friend-dot '+(x.local?"you":"")+'"></span><span></span><small>'+(x.local?"you":"here now")+'</small>';row.children[1].textContent=x.name;list.append(row)});
  }
  openShop(kind){
    const ids=kind==="decor"?["diya","flowers","rangoli","lantern"]:kind==="tea"?["jalebi","laddu"]:["kaju","laddu","jalebi"];
    const html='<p>Pick up something for your celebration. Your coins stay in this browser.</p><div class="shop-grid">'+ids.map(id=>{const i=ITEMS[id];return '<div class="shop-item"><div class="emoji">'+i.emoji+'</div><strong>'+i.name+'</strong><small>'+i.description+'</small><button class="button button-primary" data-buy="'+id+'">BUY · '+i.price+' ◉</button></div>'}).join("")+'</div>';
    this.show(kind==="decor"?"Rang & Roshni":kind==="tea"?"Chai Corner":"Mithai Mahal",html,[],"THE MARKET");
    this.content.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>this.game.buy(b.dataset.buy)));
  }
  openBag(){
    const g=this.game,entries=Object.entries(g.inventory).filter(([,n])=>n>0);
    const html=entries.length?'<div class="bag-grid">'+entries.map(([id,n])=>'<div class="bag-cell"><b>'+ITEMS[id].emoji+'</b><span>'+ITEMS[id].name+'</span><small>×'+n+'</small></div>').join("")+'</div>':'<p>Your bag is empty. Visit the market and bring home something festive.</p>';
    this.show("Your little bag",html,[{label:"BACK TO TOWN",primary:true,action:()=>this.close()}],"YOUR INVENTORY");
  }
  talk(npc){
    const line=npc.lines[Math.floor(Math.random()*npc.lines.length)];
    this.show(npc.name,line+'<p>Good things grow when neighbours share a little time together.</p>',[{label:"NICE TO MEET YOU",primary:true,action:()=>{this.game.quest.talk=true;this.refresh();this.close();this.toast("A new friend makes the town brighter.")}}],"A FRIENDLY CHAT");
  }
  interact(object){
    if(object.type==="shop"||object.type==="decor"||object.type==="tea"){if(object.type==="shop"||object.type==="decor"||object.type==="tea"){if(object.type==="shop")this.game.quest.shop=true;this.refresh();this.openShop(object.type);return}}
    if(object.type==="npc"){this.talk(object);return}
    if(object.type==="hall"){this.show("Festival Courtyard","The town's gathering place! The evening light show begins here. Take a moment to enjoy the decorations and leave a kind wish.",[{label:"LEAVE A WISH",primary:true,action:()=>{this.game.coins+=5;this.game.save();this.refresh();this.close();this.toast("A kind wish earned you 5 coins.")}},{label:"CLOSE",action:()=>this.close()}],"THE TOWN SQUARE");return}
    if(object.type==="flowers"||object.type==="lamps"||object.type==="snacks"){this.show(object.name,"A cheerful little stall. The shopkeeper waves hello and points you toward the main market.",[{label:"SAY THANKS",primary:true,action:()=>{this.close();this.toast("The shopkeeper smiles.")}}],"STREET STALL")}
  }
  buy(id){
    const item=ITEMS[id];if(!item)return;if(this.game.coins<item.price){this.toast("Not enough coins yet. Explore and complete your quest!");return}
    this.game.coins-=item.price;this.game.inventory[id]=(this.game.inventory[id]||0)+1;this.game.save();this.refresh();this.toast(item.name+" added to your bag!");
  }
  changeName(){
    this.show("What should we call you?",'<p>Choose a name for your festival avatar.</p><input id="new-name" maxlength="16" value="'+this.game.player.name.replace(/["<>]/g,"")+'" style="width:100%;padding:11px;background:#121c28;color:white;border:1px solid #43536a;border-radius:6px">',[{label:"SAVE NAME",primary:true,action:()=>{const n=document.getElementById("new-name").value.trim().slice(0,16);if(n){this.game.player.name=n;this.game.save();this.refresh();this.close();this.toast("Name updated.")}}}],"YOUR PLAYER")}
  help(){this.show("Welcome to Diwali Town","<p>Explore the market, meet neighbours, buy sweets and decorations, and collect little moments from the festival.</p><p><b>Desktop:</b> WASD or arrow keys to walk, E to interact, I to open your bag.</p><p><b>Mobile:</b> Use the joystick at the bottom-left and the E / bag buttons at the bottom-right.</p><p>Walk close to a shopkeeper, stall or town landmark to see the interaction prompt.</p>",[{label:"LET'S EXPLORE",primary:true,action:()=>this.close()}],"HOW TO PLAY")}
}
