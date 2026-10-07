const $ = s => document.querySelector(s);
const loader = $("#loader"), app = $("#app"), cake = $("#cake"), canvas = $("#cutCanvas");
const ctx = canvas.getContext("2d");
const music = $("#music"), soundBtn = $("#soundBtn"), hint = $("#cutHint");
let drawing=false, started=false, cutDone=false, points=[], audioStarted=false;

function resize(){
  const r=canvas.getBoundingClientRect(), d=devicePixelRatio||1;
  canvas.width=r.width*d; canvas.height=r.height*d; ctx.setTransform(d,0,0,d,0,0);
}
addEventListener("resize", resize);
setTimeout(()=>{loader.classList.add("hidden");app.classList.remove("hidden");resize()},900);

function point(e){
  const r=canvas.getBoundingClientRect();
  return {x:e.clientX-r.left,y:e.clientY-r.top};
}
function draw(){
  ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
  if(points.length<2)return;
  ctx.save(); ctx.lineCap="round";ctx.lineJoin="round";
  ctx.shadowBlur=18;ctx.shadowColor="#69ccff";
  ctx.strokeStyle="#dff8ff";ctx.lineWidth=3;
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle="#6bcfff";ctx.lineWidth=1;
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  ctx.restore();
}
async function startMusic(){
  if(audioStarted)return;
  audioStarted=true;
  try{music.volume=0; await music.play(); let v=0; const t=setInterval(()=>{v+=.05;music.volume=Math.min(v,.85);if(v>=.85)clearInterval(t)},100)}catch(e){}
  soundBtn.textContent="♪";
}
function begin(e){
  if(cutDone)return;
  e.preventDefault(); drawing=true; points=[point(e)]; started=true;
  startMusic(); hint.textContent="Keep going… ✨"; draw();
}
function move(e){
  if(!drawing)return;e.preventDefault();
  const p=point(e), last=points.at(-1);
  if(!last || Math.hypot(p.x-last.x,p.y-last.y)>3){points.push(p);draw()}
  if(points.length>16 && !cutDone){
    const dx=points.at(-1).x-points[0].x, dy=points.at(-1).y-points[0].y;
    if(Math.hypot(dx,dy)>Math.min(canvas.clientWidth*.35,260)) finishCut();
  }
}
function end(){drawing=false}
canvas.addEventListener("pointerdown",begin,{passive:false});
canvas.addEventListener("pointermove",move,{passive:false});
canvas.addEventListener("pointerup",end);
canvas.addEventListener("pointercancel",end);

function confetti(){
  const holder=$("#particles");
  for(let i=0;i<90;i++){
    const p=document.createElement("span");p.className="p";
    p.style.left=Math.random()*100+"vw";p.style.top=(-10-Math.random()*30)+"vh";
    p.style.setProperty("--dx",(Math.random()*240-120)+"px");
    p.style.animationDuration=(3+Math.random()*4)+"s";p.style.animationDelay=Math.random()*1.4+"s";
    p.style.width=p.style.height=(3+Math.random()*6)+"px";holder.appendChild(p);
    setTimeout(()=>p.remove(),8500);
  }
}
function finishCut(){
  if(cutDone)return; cutDone=true; drawing=false; cake.classList.add("cut");
  // Keep the visual cut elegant: a glowing split line plus separated cake halves.
  cake.classList.add("split-left");
  setTimeout(()=>{
    cake.classList.remove("split-left"); cake.classList.add("split-right");
  },70);
  setTimeout(()=>{
    $("#hero").classList.add("hidden");
    $("#celebration").classList.remove("hidden");
    confetti();
    window.scrollTo({top:0,behavior:"smooth"});
  },1100);
}
soundBtn.addEventListener("click",async()=>{
  if(music.paused){try{await music.play()}catch(e){}soundBtn.textContent="♪"}
  else{music.pause();soundBtn.textContent="🔇"}
});
$("#continueBtn").addEventListener("click",()=>{
  $("#celebration").classList.add("hidden");$("#message").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});
