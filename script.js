document.addEventListener('DOMContentLoaded', () => {
    
    // --- Main Sidebar Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');

            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            
            // Show target page
            const targetId = `page-${item.dataset.target}`;
            const targetPage = document.getElementById(targetId);
            if(targetPage) targetPage.classList.add('active');
        });
    });

    // --- Settings Sub-Navigation ---
    const setTabs = document.querySelectorAll('.set-tab');
    const setPanels = document.querySelectorAll('.set-panel');

    setTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all setting tabs
            setTabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked
            tab.classList.add('active');

            // Hide all setting panels
            setPanels.forEach(panel => panel.classList.remove('active'));
            
            // Show target panel
            const targetPanelId = `set-${tab.dataset.set}`;
            const targetPanel = document.getElementById(targetPanelId);
            if(targetPanel) targetPanel.classList.add('active');
        });
    });

    // --- Mock Segmented Control Interactions (for visual effect) ---
    const segmentedControls = document.querySelectorAll('.segmented-control');
    segmentedControls.forEach(control => {
        const buttons = control.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from siblings
                buttons.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');
            });
        });
    });

});


// --- LSDNetwork pixel platformer (kept in the existing script.js for now) ---
function initPixelWorld() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas || canvas.dataset.initialized) return;
    canvas.dataset.initialized = 'true';
    const ctx = canvas.getContext('2d');
    const status = document.getElementById('game-status');
    const countLabel = document.getElementById('game-player-count');
    const roomLabel = document.getElementById('game-room-label');
    const roomInput = document.getElementById('game-room-code');
    const nameInput = document.getElementById('game-player-name');
    const WORLD_WIDTH = 4200, WORLD_HEIGHT = 540;
    const groundY = 478;
    const platforms = [
        {x:360,y:390,w:170},{x:690,y:330,w:160},{x:1010,y:405,w:190},
        {x:1390,y:350,w:170},{x:1740,y:290,w:180},{x:2110,y:390,w:210},
        {x:2510,y:335,w:180},{x:2860,y:400,w:190},{x:3260,y:315,w:190},
        {x:3650,y:380,w:210}
    ];
    const colors = ['#f06b63','#62b7f0','#f0c75e','#a78bfa','#65c995'];
    const keys = new Set();
    let socket = null, localId = null, remotePlayers = [], cameraX = 0;
    let local = {x:90,y:groundY-42,vx:0,vy:0,onGround:true,name:'You',color:colors[0]};
    let lastTime = 0, lastSend = 0, lastJump = false, connected = false;
    let solo = true;

    // Set this after deploying worker.js, e.g. wss://lsdnetwork-game.YOUR-SUBDOMAIN.workers.dev
    const GAME_SERVER_URL = '';

    function setStatus(message) { status.textContent = message; }
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.width * (540/960) * dpr);
        ctx.setTransform(canvas.width/960,0,0,canvas.height/540,0,0);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function connect(roomCode) {
        if (!GAME_SERVER_URL) {
            setStatus('The game frontend is ready, but the multiplayer Worker URL has not been configured yet. Solo preview works now.');
            return;
        }
        if (socket) socket.close();
        const playerName = (nameInput.value.trim() || 'Player').slice(0,16);
        const url = new URL('/room/' + encodeURIComponent(roomCode), GAME_SERVER_URL);
        url.searchParams.set('name', playerName);
        const protocol = url.protocol === 'https:' ? 'wss:' : url.protocol === 'http:' ? 'ws:' : url.protocol;
        url.protocol = protocol;
        setStatus('Connecting to room ' + roomCode + '…');
        socket = new WebSocket(url.toString());
        socket.addEventListener('open', () => { connected = true; solo = false; setStatus('Connected. Share room code ' + roomCode + ' with your friends.'); });
        socket.addEventListener('message', event => {
            let data; try { data = JSON.parse(event.data); } catch { return; }
            if (data.type === 'welcome') { localId = data.playerId; roomLabel.textContent = 'room ' + roomCode; }
            if (data.type === 'state') {
                remotePlayers = data.players || [];
                countLabel.textContent = remotePlayers.length + '/5 players';
                const me = remotePlayers.find(p => p.id === localId);
                if (me) local = {...local, ...me};
            }
            if (data.type === 'error') setStatus(data.message || 'Room error.');
        });
        socket.addEventListener('close', () => { connected = false; localId = null; remotePlayers = []; countLabel.textContent = 'offline'; setStatus('Disconnected from room. You can reconnect or play solo.'); });
        socket.addEventListener('error', () => setStatus('Could not reach the game Worker. Check its URL and deployment.'));
    }

    document.getElementById('game-create-room').addEventListener('click', () => {
        const code = Math.random().toString(36).slice(2,8).toUpperCase();
        roomInput.value = code; connect(code);
    });
    document.getElementById('game-join-room').addEventListener('click', () => {
        const code = roomInput.value.trim().toUpperCase();
        if (!/^[A-Z0-9]{4,8}$/.test(code)) { setStatus('Enter a valid room code (4–8 letters or numbers).'); return; }
        connect(code);
    });
    document.getElementById('game-solo').addEventListener('click', () => {
        if (socket) socket.close();
        socket = null; connected = false; solo = true; localId = null; remotePlayers = [];
        local = {x:90,y:groundY-42,vx:0,vy:0,onGround:true,name:'You',color:colors[0]};
        cameraX = 0; roomLabel.textContent = 'solo'; countLabel.textContent = 'solo preview';
        setStatus('Solo preview active. Move with A/D or arrows and jump with Space.');
    });

    document.addEventListener('keydown', event => {
        if (event.target && ['INPUT','TEXTAREA'].includes(event.target.tagName)) return;
        const key = event.key.toLowerCase();
        if (['arrowleft','arrowright','arrowup',' '].includes(key)) event.preventDefault();
        keys.add(key);
    });
    document.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
    window.addEventListener('blur', () => keys.clear());

    function drawWorld() {
        ctx.fillStyle = '#8ed5e8'; ctx.fillRect(0,0,960,540);
        // Distant pixel hills
        for (let i=0;i<8;i++) {
            const x = ((i*240 - cameraX*0.22) % 1920 + 1920) % 1920 - 120;
            ctx.fillStyle = i%2 ? '#a6d9c0' : '#9bcdbb';
            ctx.fillRect(x,330,180,150);
            ctx.fillRect(x+35,300,110,30);
        }
        // Clouds
        for (let i=0;i<7;i++) {
            const x = ((i*310 - cameraX*0.12) % 1250 + 1250) % 1250 - 120;
            ctx.fillStyle = 'rgba(255,255,255,.72)';
            ctx.fillRect(x,85+(i%3)*35,75,18); ctx.fillRect(x+18,68+(i%3)*35,42,18);
        }
        // Ground
        ctx.fillStyle = '#6baf55'; ctx.fillRect(0,groundY,960,62);
        ctx.fillStyle = '#397b43'; ctx.fillRect(0,groundY+12,960,50);
        for (let x=0;x<1000;x+=32) {
            ctx.fillStyle = '#8bd36a'; ctx.fillRect(x,groundY,22,7);
            ctx.fillStyle = '#55934b'; ctx.fillRect(x+8,groundY+22,5,8);
        }
        // Platforms
        platforms.forEach(p => {
            const x = Math.round(p.x-cameraX);
            if (x < -220 || x > 1000) return;
            ctx.fillStyle = '#805333'; ctx.fillRect(x,p.y,p.w,18);
            ctx.fillStyle = '#5b3c2b'; ctx.fillRect(x,p.y+12,p.w,8);
            ctx.fillStyle = '#8bd36a'; ctx.fillRect(x,p.y,p.w,6);
            for(let t=8;t<p.w;t+=28){ctx.fillStyle='#9a6b40';ctx.fillRect(x+t,p.y+7,8,5);}
        });
    }
    function drawPlayer(p, isMe) {
        const x = Math.round(p.x-cameraX), y = Math.round(p.y);
        if (x < -60 || x > 1020) return;
        const color = p.color || colors[0];
        // Shadow, body and deliberately chunky pixel details
        ctx.fillStyle = 'rgba(25,45,38,.22)'; ctx.fillRect(x-3,y+40,34,5);
        ctx.fillStyle = '#263238'; ctx.fillRect(x+5,y+4,20,35);
        ctx.fillStyle = color; ctx.fillRect(x+3,y+8,24,25);
        ctx.fillStyle = '#f3c79f'; ctx.fillRect(x+6,y-2,18,15);
        ctx.fillStyle = '#27313a'; ctx.fillRect(x+5,y-5,20,7);
        ctx.fillRect(x+7,y+3,4,4); ctx.fillRect(x+19,y+3,4,4);
        ctx.fillStyle = '#fff'; ctx.fillRect(x+8,y+4,2,2); ctx.fillRect(x+20,y+4,2,2);
        ctx.fillStyle = '#27313a'; ctx.fillRect(x+7,y+32,7,10); ctx.fillRect(x+18,y+32,7,10);
        ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.textAlign='center';
        ctx.fillText((isMe?'you':(p.name||'player')).slice(0,12),x+15,y-12);
    }

    function updateSolo(dt) {
        const left = keys.has('a') || keys.has('arrowleft');
        const right = keys.has('d') || keys.has('arrowright');
        const jump = keys.has(' ') || keys.has('w') || keys.has('arrowup');
        local.vx = (right-left)*220;
        if (jump && !lastJump && local.onGround) { local.vy=-390; local.onGround=false; }
        lastJump = jump;
        const oldBottom = local.y+42;
        local.x = Math.max(0,Math.min(WORLD_WIDTH-30,local.x+local.vx*dt));
        local.vy = Math.min(700,local.vy+1000*dt);
        local.y += local.vy*dt; local.onGround=false;
        if (local.y+42 >= groundY) { local.y=groundY-42; local.vy=0; local.onGround=true; }
        platforms.forEach(p => {
            if (local.vy>=0 && oldBottom<=p.y && local.y+42>=p.y && local.x+28>p.x && local.x<p.x+p.w) {
                local.y=p.y-42; local.vy=0; local.onGround=true;
            }
        });
    }
    function frame(time) {
        const dt = Math.min((time-lastTime)/1000 || 0,0.033); lastTime=time;
        if (solo) updateSolo(dt);
        if (connected && socket && socket.readyState===WebSocket.OPEN && time-lastSend>45) {
            const jump = keys.has(' ') || keys.has('w') || keys.has('arrowup');
            socket.send(JSON.stringify({type:'input',left:keys.has('a')||keys.has('arrowleft'),right:keys.has('d')||keys.has('arrowright'),jump}));
            lastSend=time;
        }
        const me = connected ? remotePlayers.find(p=>p.id===localId) : local;
        if (me) cameraX=Math.max(0,Math.min(WORLD_WIDTH-960,me.x-420));
        drawWorld();
        if (connected) remotePlayers.forEach(p=>drawPlayer(p,p.id===localId));
        else drawPlayer(local,true);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
document.addEventListener('DOMContentLoaded', initPixelWorld);
