export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.touch = {x:0,y:0};
    this.interactPressed = false;
    this.bagPressed = false;
    this.joystick = document.getElementById("joystick-zone");
    this.knob = document.getElementById("joystick-knob");
    this.pointerId = null;
    this.center = null;
    this.bind();
  }
  bind() {
    addEventListener("keydown", e => {
      if (["INPUT","TEXTAREA"].includes(e.target?.tagName)) return;
      const key = e.key.toLowerCase();
      if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key)) e.preventDefault();
      this.keys.add(key);
      if (key === "e" || key === "enter" || key === " ") this.interactPressed = true;
      if (key === "i" || key === "b") this.bagPressed = true;
    });
    addEventListener("keyup", e => this.keys.delete(e.key.toLowerCase()));
    addEventListener("blur", () => { this.keys.clear(); this.touch.x=0; this.touch.y=0; this.resetKnob(); });
    this.joystick.addEventListener("pointerdown", e => {
      this.pointerId=e.pointerId;this.joystick.setPointerCapture(e.pointerId);
      const r=this.joystick.getBoundingClientRect();this.center={x:r.left+r.width/2,y:r.top+r.height/2};
      this.moveStick(e);
    });
    this.joystick.addEventListener("pointermove", e => {if(e.pointerId===this.pointerId)this.moveStick(e)});
    const stop=e=>{if(e.pointerId===this.pointerId){this.pointerId=null;this.touch.x=0;this.touch.y=0;this.resetKnob()}};
    this.joystick.addEventListener("pointerup",stop);this.joystick.addEventListener("pointercancel",stop);
    document.getElementById("mobile-interact").addEventListener("pointerdown",e=>{e.preventDefault();this.interactPressed=true});
    document.getElementById("mobile-bag").addEventListener("pointerdown",e=>{e.preventDefault();this.bagPressed=true});
  }
  moveStick(e) {
    const dx=e.clientX-this.center.x,dy=e.clientY-this.center.y,len=Math.hypot(dx,dy),max=32;
    const scale=len>max?max/len:1, x=dx*scale,y=dy*scale;
    this.knob.style.transform="translate("+x+"px,"+y+"px)";
    this.touch.x=x/max;this.touch.y=y/max;
  }
  resetKnob(){this.knob.style.transform="translate(0,0)"}
  getMovement() {
    const left=this.keys.has("a")||this.keys.has("arrowleft")||this.touch.x<-.25;
    const right=this.keys.has("d")||this.keys.has("arrowright")||this.touch.x>.25;
    const up=this.keys.has("w")||this.keys.has("arrowup")||this.touch.y<-.25;
    const down=this.keys.has("s")||this.keys.has("arrowdown")||this.touch.y>.25;
    let x=(right?1:0)-(left?1:0),y=(down?1:0)-(up?1:0);
    const len=Math.hypot(x,y)||1;return {x:x/len,y:y/len};
  }
  consumeInteract(){const v=this.interactPressed;this.interactPressed=false;return v}
  consumeBag(){const v=this.bagPressed;this.bagPressed=false;return v}
}
