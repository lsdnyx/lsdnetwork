import {ITEMS} from "./config.js";
export class UI {
  constructor(game){
    this.game=game;this.backdrop=document.getElementById("modal-backdrop");this.title=document.getElementById("modal-title");this.kicker=document.getElementById("modal-kicker");this.content=document.getElementById("modal-content");this.actions=document.getElementById("modal-actions");this.toastEl=document.getElementById("toast");this.toastTimer=0;
    document.getElementById("modal-close").addEventListener("click",()=>this.close());
    this.backdrop.addEventListener("pointerdown",e=>{if(e.target===this.backdrop)this.close()});
    document.getElementById("settings-button").addEventListener("click",()=>this.settings());
    document.addEventListener("keydown",e=>{if(e.key==="Escape")this.close()});
  }
  show(title,content,actions=[],kicker="DIWALI TOWN"){
    this.title.textContent=title;this.kicker.textContent=kicker;this.content.innerHTML=content;this.actions.replaceChildren();
    actions.forEach(a=>{const b=document.createElement("button");b.className="button "+(a.primary?"button-primary":"button-outline");b.textContent=a.label;b.addEventListener("click",()=>a.action());this.actions.append(b)});
    this.backdrop.hidden=false;
  }
  close(){this.backdrop.hidden=true}
  toast(message){this.toastEl.textContent=message;this.toastEl.classList.add("show");clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.toastEl.classList.remove("show"),2400)}
  refresh(){
    const g=this.game;
    const coins=document.getElementById("coin-count");if(coins)coins.textContent=g.coins;
    const status=document.getElementById("connection-label");if(status)status.textContent=g.network.connected?"PUBLIC WORLD · ONLINE":g.network.connecting?"CONNECTING TO PUBLIC WORLD": "PUBLIC WORLD · OFFLINE";
  }
  settings(){
    const network=this.game.network;
    const status=network.connected?"You are in the shared public world.":network.connecting?"Connecting to the shared public world…":"The public world server is not connected.";
    const html='<div class="settings-group"><label for="settings-name">PLAYER NAME</label><input id="settings-name" maxlength="16" value="'+this.game.player.name.replace(/["<>]/g,"")+'"></div>'+
      '<div class="settings-status">'+status+'</div>'+
      (!network.connected?'<button class="button button-primary settings-wide" id="settings-connect">'+(network.connecting?"CONNECTING…":"RECONNECT TO PUBLIC WORLD")+'</button>':'')+
      '<button class="button button-outline settings-wide" id="settings-fullscreen">⛶ '+(document.fullscreenElement?'EXIT FULLSCREEN':'FULLSCREEN')+'</button>'+
      '<p class="settings-note">Everyone plays together on the same public map. There are no room codes or private rooms.</p>';
    this.show("Game settings",html,[{label:"DONE",primary:true,action:()=>this.close()}],"YOUR GAME");
    document.getElementById("settings-name").addEventListener("change",e=>{const n=e.target.value.trim().slice(0,16);if(n){this.game.player.name=n;this.game.save();this.refresh()}});
    document.getElementById("settings-connect")?.addEventListener("click",()=>{network.connect();this.settings()});
    document.getElementById("settings-fullscreen").addEventListener("click",async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();this.settings()}catch{this.toast("Fullscreen is not available in this browser.")}});
  }
  openShop(kind){
    const ids=kind==="decor"?["diya","flowers","rangoli","lantern"]:kind==="tea"?["jalebi","laddu"]:["kaju","laddu","jalebi"];
    const html='<p>Pick up something for your celebration. Your coins stay in this browser.</p><div class="shop-grid">'+ids.map(id=>{const i=ITEMS[id];return '<div class="shop-item"><div class="emoji">'+i.emoji+'</div><strong>'+i.name+'</strong><small>'+i.description+'</small><button class="button button-primary" data-buy="'+id+'">BUY · '+i.price+' ◉</button></div>'}).join("")+'</div>';
    this.show(kind==="decor"?"Rang & Roshni":kind==="tea"?"Chai Corner":"Mithai Mahal",html,[],"THE MARKET");
    this.content.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>this.game.buy(b.dataset.buy)));
  }
  openBag(){
    const entries=Object.entries(this.game.inventory).filter(([,n])=>n>0);
    const html=entries.length?'<div class="bag-grid">'+entries.map(([id,n])=>'<div class="bag-cell"><b>'+ITEMS[id].emoji+'</b><span>'+ITEMS[id].name+'</span><small>×'+n+'</small></div>').join("")+'</div>':'<p>Your bag is empty. Visit the market and bring home something festive.</p>';
    this.show("Your little bag",html,[{label:"BACK TO TOWN",primary:true,action:()=>this.close()}],"YOUR INVENTORY");
  }
  talk(npc){
    const line=npc.lines[Math.floor(Math.random()*npc.lines.length)];
    this.show(npc.name,line+'<p>Good things grow when neighbours share a little time together.</p>',[{label:"NICE TO MEET YOU",primary:true,action:()=>{this.game.quest.talk=true;this.game.save();this.refresh();this.close();this.toast("A new friend makes the town brighter.")}}],"A FRIENDLY CHAT");
  }
  interact(object){
    if(object.type==="shop"||object.type==="decor"||object.type==="tea"){if(object.type==="shop")this.game.quest.shop=true;this.refresh();this.openShop(object.type);return}
    if(object.type==="npc"){this.talk(object);return}
    if(object.type==="hall"){this.show("Festival Courtyard","The town's gathering place! Take a moment to enjoy the decorations and leave a kind wish.",[{label:"LEAVE A WISH",primary:true,action:()=>{this.game.coins+=5;this.game.save();this.refresh();this.close();this.toast("A kind wish earned you 5 coins.")}},{label:"CLOSE",action:()=>this.close()}],"THE TOWN SQUARE");return}
    if(object.type==="flowers"||object.type==="lamps"||object.type==="snacks"){this.show(object.name,"A cheerful little stall. The shopkeeper waves hello and points you toward the main market.",[{label:"SAY THANKS",primary:true,action:()=>{this.close();this.toast("The shopkeeper smiles.")}}],"STREET STALL")}
  }
  buy(id){
    const item=ITEMS[id];if(!item)return;if(this.game.coins<item.price){this.toast("Not enough coins yet. Explore and complete your quest!");return}
    this.game.coins-=item.price;this.game.inventory[id]=(this.game.inventory[id]||0)+1;this.game.save();this.refresh();this.toast(item.name+" added to your bag!");
  }
}