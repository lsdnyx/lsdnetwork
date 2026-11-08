export class Network {
  constructor(game){
    this.game=game;this.socket=null;this.connected=false;this.connecting=false;this.playerId=null;this.players=[];this.lastSend=0;
    // Set this to the deployed Cloudflare Worker URL.
    this.serverUrl="";
  }
  connect(silent=false){
    if(!this.serverUrl){if(!silent)this.game.ui.toast("The public world server is not deployed yet.");return}
    if(this.connected||this.connecting)return;
    this.connecting=true;
    const url=new URL(this.serverUrl);url.protocol=url.protocol==="https:"?"wss:":"ws:";url.pathname="/world";url.searchParams.set("name",this.game.player.name);
    this.socket=new WebSocket(url.toString());
    this.socket.addEventListener("open",()=>{this.connected=true;this.connecting=false;this.game.ui.refresh();this.game.ui.toast("Connected to the public Diwali Town!")});
    this.socket.addEventListener("message",e=>{let data;try{data=JSON.parse(e.data)}catch{return}
      if(data.type==="welcome"){this.playerId=data.playerId;this.game.ui.refresh()}
      if(data.type==="state"){this.players=data.players||[];this.game.applyNetworkState(this.players);this.game.ui.refresh()}
      if(data.type==="error")this.game.ui.toast(data.message||"Public world error");
    });
    this.socket.addEventListener("close",()=>{this.connected=false;this.connecting=false;this.players=[];this.playerId=null;this.game.otherPlayers.clear();this.game.ui.refresh();this.game.ui.toast("Disconnected from the public world. Reconnect in Settings.")});
    this.socket.addEventListener("error",()=>{this.connecting=false;this.game.ui.refresh();this.game.ui.toast("Could not connect to the public world server.")});
    this.game.ui.refresh();
  }
  sendInput(input,now){
    if(!this.connected||!this.socket||this.socket.readyState!==WebSocket.OPEN||now-this.lastSend<50)return;
    this.socket.send(JSON.stringify({type:"input",left:input.x<-.2,right:input.x>.2,up:input.y<-.2,down:input.y>.2}));this.lastSend=now;
  }
  disconnect(){if(this.socket){this.socket.close();this.socket=null}this.connected=false;this.connecting=false;this.players=[];this.playerId=null;this.game.ui?.refresh()}
}