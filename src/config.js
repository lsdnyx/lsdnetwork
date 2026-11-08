export const TILE = 48;
export const WORLD = { width: 2400, height: 1680 };
export const PLAYER = { width: 26, height: 34, speed: 190 };
export const COLORS = ["#f18b64", "#72bde4", "#e9c56c", "#ad98e8", "#7bc99c"];

export const BUILDINGS = [
  { id:"sweet-shop", name:"Mithai Mahal", x:360,y:205,w:180,h:142, type:"shop", title:"Sweet Shop", subtitle:"Fresh mithai, made with love", color:"#d77b55", roof:"#8b3f3b", sign:"MITHAI" },
  { id:"decor-shop", name:"Rang & Roshni", x:860,y:205,w:180,h:142, type:"decor", title:"Decorations", subtitle:"Bring a little sparkle home", color:"#7d91c8", roof:"#485c9a", sign:"DECOR" },
  { id:"tea-stall", name:"Chai Corner", x:1430,y:340,w:150,h:112, type:"tea", title:"Chai Corner", subtitle:"Take a little festival break", color:"#c58a4c", roof:"#79512e", sign:"CHAI" },
  { id:"community-hall", name:"Community Courtyard", x:1000,y:1000,w:260,h:170, type:"hall", title:"Festival Courtyard", subtitle:"The heart of Diwali Town", color:"#c58e58", roof:"#7d4b38", sign:"SABHA" }
];

export const STALLS = [
  {id:"flower-stall",name:"Marigold Flowers",x:620,y:620,w:105,h:72,type:"flowers",emoji:"🌼"},
  {id:"lamp-stall",name:"Little Diyas",x:830,y:620,w:105,h:72,type:"lamps",emoji:"🪔"},
  {id:"snack-stall",name:"Snack Cart",x:1290,y:650,w:105,h:72,type:"snacks",emoji:"🥨"}
];

export const NPCS = [
  {id:"aunty",name:"Meera Aunty",x:610,y:400,color:"#c46b8c",lines:["Happy Diwali! Have you tried the kaju katli?","The whole town helped decorate these streets."]},
  {id:"uncle",name:"Ravi Uncle",x:1150,y:750,color:"#4e9d83",lines:["A festival feels brighter when everyone joins in.","The courtyard event starts after sunset."]},
  {id:"kid",name:"Chotu",x:1570,y:970,color:"#d4a64e",lines:["I made a tiny rangoli! Do you like it?","I am collecting kind wishes for the town board."]}
];

export const OBSTACLES = [
  ...BUILDINGS.map(b=>({x:b.x-8,y:b.y+20,w:b.w+16,h:b.h-12})),
  ...STALLS.map(s=>({x:s.x,y:s.y+18,w:s.w,h:s.h-10})),
  {x:190,y:700,w:120,h:70},{x:1930,y:280,w:180,h:150},
  {x:1830,y:1050,w:150,h:120},{x:480,y:1160,w:160,h:120},
  {x:1510,y:1250,w:130,h:100}
];

export const ITEMS = {
  kaju:{id:"kaju",name:"Kaju Katli",emoji:"🍬",price:15,kind:"sweet",description:"A little square of celebration."},
  laddu:{id:"laddu",name:"Motichoor Laddu",emoji:"🟠",price:12,kind:"sweet",description:"Soft, sweet and festive."},
  jalebi:{id:"jalebi",name:"Jalebi",emoji:"🥨",price:10,kind:"sweet",description:"Crispy spirals of happiness."},
  diya:{id:"diya",name:"Clay Diya",emoji:"🪔",price:18,kind:"decor",description:"A warm glow for your courtyard."},
  flowers:{id:"flowers",name:"Marigold Garland",emoji:"🌼",price:20,kind:"decor",description:"Bright flowers for the doorway."},
  rangoli:{id:"rangoli",name:"Rangoli Colours",emoji:"🎨",price:25,kind:"decor",description:"Make your own colourful pattern."},
  lantern:{id:"lantern",name:"Paper Lantern",emoji:"🏮",price:30,kind:"decor",description:"A little light floating in the night."}
};
