export class Network {
  constructor(game){
    this.game=game;this.socket=null;this.connected=false;this.roomCode="";this.playerId=null;this.players=[];this.lastSend=0;
    // After deploying the Cloudflare Worker, paste its HTTPS URL here.
    this.serverUrl="";
  }
  connect(code){
    if(!this.serverUrl){this.game.ui.toast("Online rooms need the game server to be deployed first. Solo play is ready.");return}
    this.disconnect();this.roomCode=code.toUpperCase();
    const url=new URL(this.serverUrl);url.protocol=url.protocol==="https:"?"wss:":"ws:";url.pathname="/room/"+encodeURIComponent(this.roomCode);url.searchParams.set("name",this.game.player.name);
    this.socket=new WebSocket(url.toString());this.game.ui.toast("Joining room "+this.roomCode+"…");
    this.socket.addEventListener("open",()=>{this.connected=true;this.game.ui.refresh();this.game.ui.toast("Connected to room "+this.roomCode)});
    this.socket.addEventListener("message",e=>{let data;try{data=JSON.parse(e.data)}catch{return}
      if(data.type==="welcome"){this.playerId=data.playerId;this.game.ui.refresh()}
      if(data.type==="state"){this.players=data.players||[];this.game.applyNetworkState(this.players);this.game.ui.refresh()}
      if(data.type==="error")this.game.ui.toast(data.message||"Room error");
    });
    this.socket.addEventListener("close",()=>{this.connected=false;this.players=[];this.playerId=null;this.game.ui.refresh();this.game.ui.toast("Room connection closed.")});
    this.socket.addEventListener("error",()=>this.game.ui.toast("Could not connect. Check the server deployment."));
  }
  sendInput(input,now){
    if(!this.connected||!this.socket||this.socket.readyState!==WebSocket.OPEN||now-this.lastSend<50)return;
    this.socket.send(JSON.stringify({type:"input",left:input.x<-.2,right:input.x>.2,up:input.y<-.2,down:input.y>.2}));this.lastSend=now;
  }
  disconnect(){if(this.socket){this.socket.close();this.socket=null}this.connected=false;this.players=[];this.playerId=null;this.roomCode="";this.game.ui?.refresh()}
}
